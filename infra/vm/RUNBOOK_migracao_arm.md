# Runbook — Migração do PocketBase para ARM Ampere A1 (v3.2)

**Objetivo:** eliminar de vez as quedas por falta de RAM, trocando o shape x86
E2.1.Micro (~1 GB) por um **ARM Ampere A1 Flex** (Always Free dá até **4 OCPU /
24 GB** no total da conta). O PocketBase usa ~10 MB → com 8–12 GB sobra RAM à
vontade e o *thrash* some.

> **Pré-requisitos:** a réplica de leitura já tem rede de segurança (fallback
> `PB→Apps Script` no front) e o Sheets continua master de escrita — então, se
> algo der errado na migração, **o CRM continua funcionando** (via Apps Script).
> Faça com calma.

## Situação atual (origem) — medida em 05/10/2026

| Item | Valor |
| --- | --- |
| Shape | VM.Standard.E2.1.Micro (x86, ~1 GB) |
| IP público | **163.176.154.238 (reservado)** · domínio `cibelecrm.duckdns.org` |
| SO | Oracle Linux 9.8 · user SSH `opc` · chave `~/crm-key.key` |
| PocketBase | binário **0.22.55** · serviço systemd `pocketbase` (User=`pocketbase`) |
| Dados | `/opt/pocketbase/pb_data` (**1,6 MB**) · migrations em `/opt/pocketbase/pb_migrations` |
| Backup | `/opt/pocketbase/backups/*.tgz` (cron diário 03:17 GMT) |
| Firewall | firewalld: `http https ssh` |

## Estratégia de corte (a sacada que evita downtime e re-emissão de TLS)

O IP `163.176.154.238` é **reservado**, então podemos **reatribuí-lo** do host
x86 para o novo host ARM. Como o `pb_data` carrega o cache do certificado
Let's Encrypt, ao restaurar o `pb_data` **e** reusar o mesmo IP, o novo host
sobe já com **o mesmo domínio e o mesmo certificado** — sem tocar no DuckDNS e
sem esperar emissão de TLS. A troca é só "desatribuir IP do x86 → atribuir no
ARM" (janela de segundos, coberta pelo fallback).

---

## Passo 0 — Pré-flight (no x86 atual)

Tirar um backup fresco e extrair a chave pública (pra cadastrar no novo host):

```bash
# backup a quente do pb_data atual
ssh -i ~/crm-key.key opc@163.176.154.238 'sudo /opt/pocketbase/backup_pbdata.sh && ls -1t /opt/pocketbase/backups/*.tgz | head -1'

# chave pública que o novo host deve aceitar (mesma chave => mesmo acesso)
ssh-keygen -y -f ~/crm-key.key
```

## Passo 1 — Criar a instância ARM (Console da Oracle) — AÇÃO DO USUÁRIO

1. **Compute → Instances → Create instance.**
2. **Image and shape:** Shape → **Ampere** → `VM.Standard.A1.Flex`. A linha da
   forma mostra o **default 1 OCPU / 6 GB** (os "(80 máx)/(512 máx)" são o teto
   de hardware, não o limite free). Após **Selecionar forma**, nos campos
   **Número de OCPUs** e **Quantidade de memória** deixe **1 OCPU / 6 GB** — já
   é **6× a RAM atual** e sobra pro PocketBase (~10 MB). Opcional: 2 OCPU / 12 GB
   (também Always Free, até 4 OCPU/24 GB no total da conta). Image: **Oracle
   Linux 9** (aarch64).
3. **Networking:** mesma **VCN/subnet** do host atual (pra herdar as Security
   Lists 22/80/443). Atribuir um IP público efêmero por ora (vamos trocar pelo
   reservado no corte).
4. **SSH keys:** colar a chave pública do Passo 0 (saída do `ssh-keygen -y`) —
   assim a `~/crm-key.key` já conecta.
5. Criar.

> **Pegadinha "Out of capacity":** o A1 Always Free vive sem capacidade. Se der
> erro, tente: outro **Availability Domain** (AD-1/2/3), horários diferentes,
> ou 1 OCPU/6 GB. Vale insistir — não há custo.

Anote o IP efêmero do novo host (`<IP_ARM>`) e confirme o SSH:
```bash
ssh -i ~/crm-key.key opc@<IP_ARM> 'uptime && uname -m'   # deve dizer aarch64
```

## Passo 2 — Preparar o host ARM (eu rodo por SSH)

```bash
# firewall
ssh -i ~/crm-key.key opc@<IP_ARM> 'sudo firewall-cmd --permanent --add-service=http --add-service=https && sudo firewall-cmd --reload'

# usuário de serviço + diretórios
ssh -i ~/crm-key.key opc@<IP_ARM> '
  sudo useradd -r -s /sbin/nologin pocketbase 2>/dev/null || true
  sudo mkdir -p /opt/pocketbase/pb_data /opt/pocketbase/backups
'

# tuning anti-thrash (mesmo que o x86 — já versionado no repo)
scp -i ~/crm-key.key infra/vm/99-pocketbase-lowmem.conf infra/vm/zram-swap.service \
    infra/vm/backup_pbdata.sh opc@<IP_ARM>:/tmp/
ssh -i ~/crm-key.key opc@<IP_ARM> '
  sudo install -m0644 /tmp/99-pocketbase-lowmem.conf /etc/sysctl.d/ && sudo sysctl --system >/dev/null
  sudo install -m0644 /tmp/zram-swap.service /etc/systemd/system/
  echo zram | sudo tee /etc/modules-load.d/zram.conf >/dev/null
  sudo install -m0755 /tmp/backup_pbdata.sh /opt/pocketbase/backup_pbdata.sh
  sudo systemctl daemon-reload && sudo systemctl enable --now zram-swap
'
```
> Num host com 12 GB o zram é opcional, mas deixa o padrão idêntico e barato.

## Passo 3 — Instalar o PocketBase **arm64** (sem `dnf`)

```bash
ssh -i ~/crm-key.key opc@<IP_ARM> '
  cd /opt/pocketbase
  V=0.22.55
  curl -sL -o pb.zip https://github.com/pocketbase/pocketbase/releases/download/v$V/pocketbase_${V}_linux_arm64.zip
  python3 -m zipfile -e pb.zip . && rm pb.zip
  chmod +x pocketbase && ./pocketbase --version
'
```

## Passo 4 — Trazer os dados (restaurar o pb_data)

```bash
# copiar o backup fresco do x86 para a sua máquina e de lá para o ARM
scp -i ~/crm-key.key opc@163.176.154.238:/opt/pocketbase/backups/<BACKUP>.tgz /tmp/
scp -i ~/crm-key.key /tmp/<BACKUP>.tgz opc@<IP_ARM>:/tmp/

ssh -i ~/crm-key.key opc@<IP_ARM> '
  cd /opt/pocketbase
  sudo tar xzf /tmp/<BACKUP>.tgz -C /opt/pocketbase   # recria pb_data/
  sudo chown -R pocketbase:pocketbase /opt/pocketbase
'
```

## Passo 5 — Validar o ARM **antes** do corte (sem domínio, porta alta)

Sobe o PB sem TLS numa porta interna só pra conferir que os dados vieram:

```bash
ssh -i ~/crm-key.key opc@<IP_ARM> '
  cd /opt/pocketbase
  sudo -u pocketbase ./pocketbase serve --http 127.0.0.1:8090 --dir=/opt/pocketbase/pb_data &
  sleep 3
  curl -s http://127.0.0.1:8090/api/health
  # conferência dos dados restaurados:
  sudo python3 -c "import sqlite3;c=sqlite3.connect(\"file:/opt/pocketbase/pb_data/data.db?mode=ro\",uri=True);\
print({t:c.execute(f\"SELECT count(*) FROM \\\"{t}\\\"\").fetchone()[0] for t in [\"clientes\",\"eventos\",\"financeiro\",\"listas\"]})"
  sudo pkill -f "pocketbase serve --http" 
'
```
Esperado: `health` 200 e as contagens batendo com o x86.

## Passo 6 — Instalar o serviço systemd (igual ao x86)

```bash
ssh -i ~/crm-key.key opc@<IP_ARM> '
  sudo tee /etc/systemd/system/pocketbase.service >/dev/null <<EOF
[Unit]
Description=PocketBase (CRM Cibele Matozo - ARM A1)
After=network.target

[Service]
Type=simple
User=pocketbase
Group=pocketbase
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve cibelecrm.duckdns.org --dir=/opt/pocketbase/pb_data
Restart=always
RestartSec=5
LimitNOFILE=4096
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
EOF
  sudo systemctl daemon-reload && sudo systemctl enable pocketbase
'
```
> **Ainda não** dê `start` com o domínio: sem o IP certo, o Let's Encrypt não
> valida. O start real acontece logo após o corte do IP (Passo 7).

## Passo 7 — O corte (reatribuir o IP reservado) — AÇÃO DO USUÁRIO

No **Console da Oracle**:
1. **Parar o PB no x86** (pra não divergir dados): 
   `ssh -i ~/crm-key.key opc@163.176.154.238 'sudo systemctl stop pocketbase'`
   (opcional, mas recomendado — a partir daqui o x86 não recebe mais escrita).
2. **Networking → IP Addresses** do x86 → na VNIC, **desatribuir** o IP
   reservado `163.176.154.238`.
3. Na VNIC do **ARM**, **atribuir** esse mesmo IP reservado (como IP público).
4. Subir o PB no ARM:
   `ssh -i ~/crm-key.key opc@163.176.154.238 'sudo systemctl start pocketbase'`
   (agora esse IP é o ARM).

> Durante os segundos do corte, o front cai no Apps Script (fallback) — CRM
> segue no ar, só mais lento.

## Passo 8 — Validação final

```bash
curl -s -m 15 -o /dev/null -w "HTTP %{http_code} em %{time_total}s\n" https://cibelecrm.duckdns.org/api/health
ssh -i ~/crm-key.key opc@163.176.154.238 'uname -m && free -m && systemctl is-active pocketbase zram-swap'
```
No CRM: Ctrl+Shift+R, passar as telas, `console.table(window.__perf)` (o
`PB carregarTudo` deve seguir em dezenas de ms, agora sem risco de queda).
Instalar o cron de backup no ARM:
```bash
ssh -i ~/crm-key.key opc@163.176.154.238 'echo "17 3 * * * root /opt/pocketbase/backup_pbdata.sh >> /opt/pocketbase/backups/backup.log 2>&1" | sudo tee /etc/cron.d/pocketbase-backup'
```

## Passo 9 — Desmobilizar o x86

Deixe o x86 **parado alguns dias** como rede de segurança. Confirmado tudo ok,
**termine a instância** (Console → Terminate) — libera a cota do Always Free.

---

## Rollback

Se algo falhar no ARM, **reatribua o IP reservado de volta ao x86** (Passo 7
ao contrário) e suba o PB nele (`systemctl start pocketbase`). Como o x86 ficou
parado (dados congelados no momento do corte) e o Sheets é o master, basta
rodar `sincronizarPBTudo` no Apps Script depois para reconciliar.

## Notas

- **Sem mudança no front nem no DuckDNS:** mesmo IP, mesmo domínio, mesmo
  certificado (vem no `pb_data`). O `config.js` não muda.
- **Credenciais:** o usuário de app (`app@cibelecrm.duckdns.org`) e o admin do
  PB vêm no `pb_data` restaurado — não precisa recriar.
- **Arquitetura inalterada:** Sheets master de escrita + `sincronizarPB.gs`
  espelhando; o ARM é só a mesma réplica de leitura, agora sem sufoco de RAM.
