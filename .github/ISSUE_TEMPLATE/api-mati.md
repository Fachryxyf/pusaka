---
name: API mati atau berubah
about: Endpoint di registry berhenti bekerja, atau bentuk responsnya berubah
labels: api
---

**API mana**
Slug di `registry/apis/` — misalnya `gempa-bmkg`.

**Endpoint mana**
Id endpointnya, misalnya `autogempa`.

**Apa yang terjadi**
Status code, `Content-Type`, dan apa yang dibalas. Kalau bisa, sertakan hasil `curl`-nya:

```
curl -sSD - -A 'PusakaBot/1.0 (+https://github.com/Fachryxyf/pusaka)' '<url lengkap>' | head -40
```

**Kapan kamu memeriksanya**
Tanggal. Status API berubah terus, jadi ini penting.

**Catatan**
Kalau bentuk responsnya berubah, sebutkan field mana yang hilang atau berubah tipe supaya
`REFERENCE.md` bisa diperbarui.
