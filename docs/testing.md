# Testing Web

## FASE 1 — Autentikasi

### Uji 1.1 — Login Admin (Ambil Token)

**Request**

```http
POST {{base_url}}/api/auth/login
```

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**

```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MDA1MDg3MSwiZXhwIjoxNzkwMTM3MjcxfQ.CGW5Jf-ZLRoPysoRShSqO6LBfe9S7FOuHnJEC1hivD8",
    "role": "ADMIN"
}
```

**Hasil**
- passed — Status 200
- passed — Role adalah ADMIN

**Script**

```javascript
pm.test('Status 200', () => pm.response.to.have.status(200));
if (pm.response.code === 200) {
    const json = pm.response.json();
    pm.environment.set('token_admin', json.token);
    pm.test('Role adalah ADMIN', () => pm.expect(json.role).to.eql('ADMIN'));
}
```

### Uji 1.2 — Registrasi User Biasa

**Request**

```http
POST {{base_url}}/api/auth/register
```

```json
{
  "username": "user",
  "password": "user123"
}
```

**Response**

```json
{
    "success": true,
    "message": "User berhasil didaftarkan"
}
```

### Uji 1.3 — Registrasi Duplikat (Negative Test)

**Request**

```http
POST {{base_url}}/api/auth/register
```

```json
{
  "username": "user",
  "password": "user123"
}
```

**Response**

```json
{
    "success": false,
    "message": "Username sudah terdaftar"
}
```

### Uji 1.4 — Login User Biasa

**Request**

```http
POST {{base_url}}/api/auth/login
```

```json
{
  "username": "user",
  "password": "user123"
}
```

**Response**

```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3OTAwNTE1MzIsImV4cCI6MTc5MDEzNzkzMn0.b95aMtnhNGx5rbSJromDi7rkW6aCsESmHI5wFeGV11s",
    "role": "USER"
}
```

**Hasil**
- passed — Status 200
- passed — Role adalah USER

**Script**

```javascript
pm.test('Status 200', () => pm.response.to.have.status(200));
if (pm.response.code === 200) {
    const json = pm.response.json();
    pm.environment.set('token_user', json.token);
    pm.test('Role adalah USER', () => pm.expect(json.role).to.eql('USER'));
}
```

### Uji 1.5 — Login Salah Password (Negative Test)

**Request 1**

```http
POST {{base_url}}/api/auth/login
```

```json
{
  "username": "admin",
  "password": "salah"
}
```

**Request 2**

```json
{
  "username": "admin",
  "password": "admin1233"
}
```

**Response 1**

```json
{
    "success": false,
    "message": "[\n  {\n    \"code\": \"too_small\",\n    \"minimum\": 6,\n    \"type\": \"string\",\n    \"inclusive\": true,\n    \"exact\": false,\n    \"message\": \"String must contain at least 6 character(s)\",\n    \"path\": [\n      \"password\"\n    ]\n  }\n]"
}
```

**Response 2**

```json
{
    "success": false,
    "message": "Username atau password salah"
}
```

---

## FASE 2 — Proteksi Akses (RBAC)

### Uji 2.1 — Akses Tanpa Token (401)

```http
GET {{base_url}}/api/items
```

**Response**

```json
{
    "success": false,
    "message": "Token tidak ditemukan"
}
```

### Uji 2.2 — Akses dengan Token Invalid (401)

```http
GET {{base_url}}/api/items
Authorization = Bearer token_palsu_123
```

**Response**

```json
{
    "success": false,
    "message": "Token tidak valid atau expired"
}
```

### Uji 2.3 — USER Akses Endpoint Read (200)

```http
GET {{base_url}}/api/items
Authorization = Bearer {{token_user}}
```

**Response**

```json
{
    "success": true,
    "data": []
}
```

### Uji 2.4 — USER Akses Endpoint Admin (403)

```http
POST {{base_url}}/api/categories
```

```json
{
  "nama": "Test Kategori"
}
```

**Response**

```json
{
    "success": false,
    "message": "Akses ditolak: role tidak mencukupi"
}
```

---

## FASE 3 — Master Data (Kategori & Lokasi)

### Uji 3.1 — Create Kategori #1

```http
POST {{base_url}}/api/categories
Authorization = Bearer {{token_admin}}
```

```json
{
  "nama": "Alat Tulis"
}
```

**Response**

```json
{
    "success": true,
    "data": {
        "id": 2,
        "nama": "Alat Tulis",
        "createdAt": "2026-09-22T06:09:13.231Z"
    }
}
```

**Hasil**
- passed — Status 201

**Script**

```javascript
pm.test('Status 201', () => pm.response.to.have.status(201));
if (pm.response.code === 201) {
    pm.environment.set('category_id', pm.response.json().data.id);
}
```

### Uji 3.2 — Create Kategori #2

```http
POST {{base_url}}/api/categories
Authorization = Bearer {{token_admin}}
```

```json
{
  "nama": "Elektronik"
}
```

**Response**

```json
{
    "success": true,
    "data": {
        "id": 3,
        "nama": "Elektronik",
        "createdAt": "2026-09-22T06:31:24.036Z"
    }
}
```

### Uji 3.3 — List Kategori

```http
GET {{base_url}}/api/categories
Authorization = Bearer {{token_admin}}
```

**Response**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "nama": "Alat Tulis",
            "createdAt": "2026-09-22T06:09:13.231Z"
        },
        {
            "id": 2,
            "nama": "Elektronik",
            "createdAt": "2026-09-22T06:31:24.036Z"
        }
    ]
}
```

### Uji 3.4 — Update Kategori

```http
PUT {{base_url}}/api/categories/{{category_id}}
Authorization = Bearer {{token_admin}}
```

**Response**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "nama": "Alat Tulis Kantor",
        "createdAt": "2026-09-22T06:09:13.231Z"
    }
}
```

### Uji 3.5 — Create Lokasi #1

```http
POST {{base_url}}/api/locations
Authorization = Bearer {{token_admin}}
```

**Response**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "nama": "Gudang A",
        "createdAt": "2026-09-22T06:49:48.430Z"
    }
}
```

**Script**

```javascript
pm.test('Status 201', () => pm.response.to.have.status(201));
if (pm.response.code === 201) {
    pm.environment.set('location_id', pm.response.json().data.id);
}
```

### Uji 3.6 — Create Lokasi #2

```http
POST {{base_url}}/api/locations
Authorization = Bearer {{token_admin}}
```

**Response**

```json
{
    "success": true,
    "data": {
        "id": 2,
        "nama": "Rak Display",
        "createdAt": "2026-09-22T06:58:18.846Z"
    }
}
```

### Uji 3.7 — List Lokasi

```http
GET {{base_url}}/api/locations
Authorization = Bearer {{token_admin}}
```

**Response**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "nama": "Gudang A",
            "createdAt": "2026-09-22T06:56:25.929Z"
        },
        {
            "id": 2,
            "nama": "Rak Display",
            "createdAt": "2026-09-22T06:58:18.846Z"
        }
    ]
}
```

---

## FASE 4 — Item & Price History

### Uji 4.1 — Create Item (Harga Awal 45000)

```http
POST {{base_url}}/api/items
Authorization = Bearer {{token_admin}}
```

```json
{
  "namaBarang": "Kertas HVS A4",
  "categoryId": {{category_id}},
  "locationId": {{location_id}},
  "harga": 45000,
  "deskripsi": "Rim isi 500 lembar"
}
```

**Response**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "categoryId": 1,
        "locationId": 1,
        "namaBarang": "Kertas HVS A4",
        "hargaSaatIni": "45000",
        "deskripsi": "Rim isi 500 lembar",
        "createdAt": "2026-09-22T07:04:49.304Z",
        "updatedAt": "2026-09-22T07:04:49.304Z",
        "category": {
            "id": 1,
            "nama": "Alat Tulis Kantor",
            "createdAt": "2026-09-22T06:09:13.231Z"
        },
        "location": {
            "id": 1,
            "nama": "Gudang A",
            "createdAt": "2026-09-22T06:56:25.929Z"
        },
        "priceHistory": [
            {
                "id": 1,
                "itemId": 1,
                "harga": "45000",
                "tanggalPerubahan": "2026-09-22T07:04:49.319Z"
            }
        ]
    }
}
```

**Hasil**
- passed — Status 201
- passed — priceHistory berisi 1 record
- passed — hargaSaatIni = 45000

**Script**

```javascript
pm.test('Status 201', () => pm.response.to.have.status(201));
const json = pm.response.json();
pm.test('priceHistory berisi 1 record', () => {
    pm.expect(json.data.priceHistory.length).to.eql(1);
});
pm.test('hargaSaatIni = 45000', () => {
    pm.expect(Number(json.data.hargaSaatIni)).to.eql(45000);
});
pm.environment.set('item_id', json.data.id);
```

### Uji 4.2 — Update Harga #1 (48000)

```http
PATCH {{base_url}}/api/items/{{item_id}}/price
Authorization = Bearer {{token_admin}}
```

```json
{
  "hargaBaru": 48000
}
```

**Response**

```json
{
    "success": true,
    "message": "Harga berhasil diperbarui",
    "data": {
        "id": 1,
        "categoryId": 1,
        "locationId": 1,
        "namaBarang": "Kertas HVS A4",
        "hargaSaatIni": "48000",
        "deskripsi": "Rim isi 500 lembar",
        "createdAt": "2026-09-22T07:04:49.304Z",
        "updatedAt": "2026-09-22T07:17:38.541Z",
        "category": {
            "id": 1,
            "nama": "Alat Tulis Kantor",
            "createdAt": "2026-09-22T06:09:13.231Z"
        },
        "location": {
            "id": 1,
            "nama": "Gudang A",
            "createdAt": "2026-09-22T06:56:25.929Z"
        },
        "priceHistory": [
            {
                "id": 2,
                "itemId": 1,
                "harga": "48000",
                "tanggalPerubahan": "2026-09-22T07:17:38.547Z"
            },
            {
                "id": 1,
                "itemId": 1,
                "harga": "45000",
                "tanggalPerubahan": "2026-09-22T07:04:49.319Z"
            }
        ]
    }
}
```

**Hasil**
- passed — Status 200
- passed — priceHistory = 2
- passed — harga terbaru = 48000

**Script**

```javascript
const json = pm.response.json();
pm.test('Status 200', () => pm.response.to.have.status(200));
pm.test('priceHistory = 2', () => {
    pm.expect(json.data.priceHistory.length).to.eql(2);
});
pm.test('harga terbaru = 48000', () => {
    pm.expect(Number(json.data.priceHistory[0].harga)).to.eql(48000);
});
```

### Uji 4.3 — Update Harga #2 (50000)

```http
PATCH {{base_url}}/api/items/{{item_id}}/price
Authorization = Bearer {{token_admin}}
```

```json
{
  "hargaBaru": 50000
}
```

**Response**

```json
{
    "success": true,
    "message": "Harga berhasil diperbarui",
    "data": {
        "id": 1,
        "categoryId": 1,
        "locationId": 1,
        "namaBarang": "Kertas HVS A4",
        "hargaSaatIni": "50000",
        "deskripsi": "Rim isi 500 lembar",
        "createdAt": "2026-09-22T07:04:49.304Z",
        "updatedAt": "2026-09-22T07:21:09.028Z",
        "category": {
            "id": 1,
            "nama": "Alat Tulis Kantor",
            "createdAt": "2026-09-22T06:09:13.231Z"
        },
        "location": {
            "id": 1,
            "nama": "Gudang A",
            "createdAt": "2026-09-22T06:56:25.929Z"
        },
        "priceHistory": [
            {
                "id": 3,
                "itemId": 1,
                "harga": "50000",
                "tanggalPerubahan": "2026-09-22T07:21:09.031Z"
            },
            {
                "id": 2,
                "itemId": 1,
                "harga": "48000",
                "tanggalPerubahan": "2026-09-22T07:17:38.547Z"
            },
            {
                "id": 1,
                "itemId": 1,
                "harga": "45000",
                "tanggalPerubahan": "2026-09-22T07:04:49.319Z"
            }
        ]
    }
}
```

### Uji 4.4 — Update Harga #3 (52000) — Uji Sliding Window

```http
PATCH {{base_url}}/api/items/{{item_id}}/price
Authorization = Bearer {{token_admin}}
```

```json
{
  "hargaBaru": 52000
}
```

**Response**

```json
{
    "success": true,
    "message": "Harga berhasil diperbarui",
    "data": {
        "id": 1,
        "categoryId": 1,
        "locationId": 1,
        "namaBarang": "Kertas HVS A4",
        "hargaSaatIni": "52000",
        "deskripsi": "Rim isi 500 lembar",
        "createdAt": "2026-09-22T07:04:49.304Z",
        "updatedAt": "2026-09-22T07:25:54.608Z",
        "category": {
            "id": 1,
            "nama": "Alat Tulis Kantor",
            "createdAt": "2026-09-22T06:09:13.231Z"
        },
        "location": {
            "id": 1,
            "nama": "Gudang A",
            "createdAt": "2026-09-22T06:56:25.929Z"
        },
        "priceHistory": [
            {
                "id": 4,
                "itemId": 1,
                "harga": "52000",
                "tanggalPerubahan": "2026-09-22T07:25:54.633Z"
            },
            {
                "id": 3,
                "itemId": 1,
                "harga": "50000",
                "tanggalPerubahan": "2026-09-22T07:21:09.031Z"
            },
            {
                "id": 2,
                "itemId": 1,
                "harga": "48000",
                "tanggalPerubahan": "2026-09-22T07:17:38.547Z"
            }
        ]
    }
}
```

**Hasil**
- passed — Status 200
- passed — priceHistory TETAP 3 (sliding window)
- passed — Harga tertua (45000) sudah terhapus
- passed — Harga terbaru = 52000

**Script**

```javascript
const json = pm.response.json();
pm.test('Status 200', () => pm.response.to.have.status(200));
pm.test('priceHistory TETAP 3 (sliding window)', () => {
    pm.expect(json.data.priceHistory.length).to.eql(3);
});
pm.test('Harga tertua (45000) sudah terhapus', () => {
    const hargas = json.data.priceHistory.map(p => Number(p.harga));
    pm.expect(hargas).to.not.include(45000);
});
pm.test('Harga terbaru = 52000', () => {
    pm.expect(Number(json.data.priceHistory[0].harga)).to.eql(52000);
});
```

### Uji 4.5 — Update Harga #4 (55000)

```http
PATCH {{base_url}}/api/items/{{item_id}}/price
Authorization = Bearer {{token_admin}}
```

```json
{
  "hargaBaru": 55000
}
```

**Response**

```json
{
    "success": true,
    "message": "Harga berhasil diperbarui",
    "data": {
        "id": 1,
        "categoryId": 1,
        "locationId": 1,
        "namaBarang": "Kertas HVS A4",
        "hargaSaatIni": "55000",
        "deskripsi": "Rim isi 500 lembar",
        "createdAt": "2026-09-22T07:04:49.304Z",
        "updatedAt": "2026-09-22T07:29:45.386Z",
        "category": {
            "id": 1,
            "nama": "Alat Tulis Kantor",
            "createdAt": "2026-09-22T06:09:13.231Z"
        },
        "location": {
            "id": 1,
            "nama": "Gudang A",
            "createdAt": "2026-09-22T06:56:25.929Z"
        },
        "priceHistory": [
            {
                "id": 5,
                "itemId": 1,
                "harga": "55000",
                "tanggalPerubahan": "2026-09-22T07:29:45.388Z"
            },
            {
                "id": 4,
                "itemId": 1,
                "harga": "52000",
                "tanggalPerubahan": "2026-09-22T07:25:54.633Z"
            },
            {
                "id": 3,
                "itemId": 1,
                "harga": "50000",
                "tanggalPerubahan": "2026-09-22T07:21:09.031Z"
            }
        ]
    }
}
```

### Uji 4.6 — GET /api/items (Termasuk Relasi)

```http
GET {{base_url}}/api/items
Authorization = Bearer {{token_admin}}
```

**Response**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "categoryId": 1,
            "locationId": 1,
            "namaBarang": "Kertas HVS A4",
            "hargaSaatIni": "55000",
            "deskripsi": "Rim isi 500 lembar",
            "createdAt": "2026-09-22T07:04:49.304Z",
            "updatedAt": "2026-09-22T07:29:45.386Z",
            "category": {
                "id": 1,
                "nama": "Alat Tulis Kantor",
                "createdAt": "2026-09-22T06:09:13.231Z"
            },
            "location": {
                "id": 1,
                "nama": "Gudang A",
                "createdAt": "2026-09-22T06:56:25.929Z"
            },
            "priceHistory": [
                {
                    "id": 5,
                    "itemId": 1,
                    "harga": "55000",
                    "tanggalPerubahan": "2026-09-22T07:29:45.388Z"
                },
                {
                    "id": 4,
                    "itemId": 1,
                    "harga": "52000",
                    "tanggalPerubahan": "2026-09-22T07:25:54.633Z"
                },
                {
                    "id": 3,
                    "itemId": 1,
                    "harga": "50000",
                    "tanggalPerubahan": "2026-09-22T07:21:09.031Z"
                }
            ]
        }
    ]
}
```

**Hasil**
- passed — Status 200
- passed — Item include category & location
- passed — priceHistory urut DESC

**Script**

```javascript
const json = pm.response.json();
pm.test('Status 200', () => pm.response.to.have.status(200));
pm.test('Item include category & location', () => {
    pm.expect(json.data[0]).to.have.property('category');
    pm.expect(json.data[0]).to.have.property('location');
});
pm.test('priceHistory urut DESC', () => {
    const h = json.data[0].priceHistory.map(p => Number(p.harga));
    pm.expect(h).to.eql([...h].sort((a,b) => b-a));
});
```

### Uji 4.7 — Filter by Category

```http
GET {{base_url}}/api/items?categoryId={{category_id}}
```

**Response**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "categoryId": 1,
            "locationId": 1,
            "namaBarang": "Kertas HVS A4",
            "hargaSaatIni": "55000",
            "deskripsi": "Rim isi 500 lembar",
            "createdAt": "2026-09-22T07:04:49.304Z",
            "updatedAt": "2026-09-22T07:29:45.386Z",
            "category": {
                "id": 1,
                "nama": "Alat Tulis Kantor",
                "createdAt": "2026-09-22T06:09:13.231Z"
            },
            "location": {
                "id": 1,
                "nama": "Gudang A",
                "createdAt": "2026-09-22T06:56:25.929Z"
            },
            "priceHistory": [
                {
                    "id": 5,
                    "itemId": 1,
                    "harga": "55000",
                    "tanggalPerubahan": "2026-09-22T07:29:45.388Z"
                },
                {
                    "id": 4,
                    "itemId": 1,
                    "harga": "52000",
                    "tanggalPerubahan": "2026-09-22T07:25:54.633Z"
                },
                {
                    "id": 3,
                    "itemId": 1,
                    "harga": "50000",
                    "tanggalPerubahan": "2026-09-22T07:21:09.031Z"
                }
            ]
        }
    ]
}
```

### Uji 4.8 — Filter by Location

```http
GET {{base_url}}/api/items?locationId={{location_id}}
```

**Response**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "categoryId": 1,
            "locationId": 1,
            "namaBarang": "Kertas HVS A4",
            "hargaSaatIni": "55000",
            "deskripsi": "Rim isi 500 lembar",
            "createdAt": "2026-09-22T07:04:49.304Z",
            "updatedAt": "2026-09-22T07:29:45.386Z",
            "category": {
                "id": 1,
                "nama": "Alat Tulis Kantor",
                "createdAt": "2026-09-22T06:09:13.231Z"
            },
            "location": {
                "id": 1,
                "nama": "Gudang A",
                "createdAt": "2026-09-22T06:56:25.929Z"
            },
            "priceHistory": [
                {
                    "id": 5,
                    "itemId": 1,
                    "harga": "55000",
                    "tanggalPerubahan": "2026-09-22T07:29:45.388Z"
                },
                {
                    "id": 4,
                    "itemId": 1,
                    "harga": "52000",
                    "tanggalPerubahan": "2026-09-22T07:25:54.633Z"
                },
                {
                    "id": 3,
                    "itemId": 1,
                    "harga": "50000",
                    "tanggalPerubahan": "2026-09-22T07:21:09.031Z"
                }
            ]
        }
    ]
}
```

### Uji 4.9 — Search by Nama

```http
GET {{base_url}}/api/items?search=Kertas
```

**Response**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "categoryId": 1,
            "locationId": 1,
            "namaBarang": "Kertas HVS A4",
            "hargaSaatIni": "55000",
            "deskripsi": "Rim isi 500 lembar",
            "createdAt": "2026-09-22T07:04:49.304Z",
            "updatedAt": "2026-09-22T07:29:45.386Z",
            "category": {
                "id": 1,
                "nama": "Alat Tulis Kantor",
                "createdAt": "2026-09-22T06:09:13.231Z"
            },
            "location": {
                "id": 1,
                "nama": "Gudang A",
                "createdAt": "2026-09-22T06:56:25.929Z"
            },
            "priceHistory": [
                {
                    "id": 5,
                    "itemId": 1,
                    "harga": "55000",
                    "tanggalPerubahan": "2026-09-22T07:29:45.388Z"
                },
                {
                    "id": 4,
                    "itemId": 1,
                    "harga": "52000",
                    "tanggalPerubahan": "2026-09-22T07:25:54.633Z"
                },
                {
                    "id": 3,
                    "itemId": 1,
                    "harga": "50000",
                    "tanggalPerubahan": "2026-09-22T07:21:09.031Z"
                }
            ]
        }
    ]
}
```

### Uji 4.10 — Update Metadata Item

```http
PUT {{base_url}}/api/items/{{item_id}}
Authorization = Bearer {{token_admin}}
```

```json
{
  "namaBarang": "Kertas HVS A4 Premium",
  "deskripsi": "Rim isi 500 lembar, gramatur 80gsm"
}
```

**Response**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "categoryId": 1,
        "locationId": 1,
        "namaBarang": "Kertas HVS A4 Premium",
        "hargaSaatIni": "55000",
        "deskripsi": "Rim isi 500 lembar, gramatur 80gsm",
        "createdAt": "2026-09-22T07:04:49.304Z",
        "updatedAt": "2026-09-22T07:40:13.961Z",
        "category": {
            "id": 1,
            "nama": "Alat Tulis Kantor",
            "createdAt": "2026-09-22T06:09:13.231Z"
        },
        "location": {
            "id": 1,
            "nama": "Gudang A",
            "createdAt": "2026-09-22T06:56:25.929Z"
        },
        "priceHistory": [
            {
                "id": 5,
                "itemId": 1,
                "harga": "55000",
                "tanggalPerubahan": "2026-09-22T07:29:45.388Z"
            },
            {
                "id": 4,
                "itemId": 1,
                "harga": "52000",
                "tanggalPerubahan": "2026-09-22T07:25:54.633Z"
            },
            {
                "id": 3,
                "itemId": 1,
                "harga": "50000",
                "tanggalPerubahan": "2026-09-22T07:21:09.031Z"
            }
        ]
    }
}
```

---

## FASE 5 — Constraint & Cascade

### Uji 5.1 — Hapus Kategori yang Masih Dipakai (409)

```http
DELETE {{base_url}}/api/categories/{{category_id}}
Authorization = Bearer {{token_admin}}
```

**Response**

```json
{
    "success": false,
    "message": "Operasi gagal: data masih direferensikan oleh tabel lain (Restrict)."
}
```

### Uji 5.2 — Hapus Lokasi yang Masih Dipakai (409)

```http
DELETE {{base_url}}/api/locations/{{location_id}}
Authorization = Bearer {{token_admin}}
```

**Response**

```json
{
    "success": false,
    "message": "Operasi gagal: data masih direferensikan oleh tabel lain (Restrict)."
}
```

### Uji 5.3 — Verifikasi Cascade Delete

```http
DELETE {{base_url}}/api/items/{{item_id}}
Authorization = Bearer {{token_admin}}
```

**Response**

```json
{
    "success": true,
    "message": "Barang berhasil dihapus"
}
```

**Hasil**
- passed — Status 200
- passed — Message benar

**Script**

```javascript
pm.test('Status 200', () => pm.response.to.have.status(200));
pm.test('Message benar', () => {
    pm.expect(pm.response.json().message).to.include('berhasil dihapus');
});
```

### Uji 5.4 — Hapus Kategori Setelah Item Dihapus (200)

```http
DELETE {{base_url}}/api/categories/{{category_id}}
Authorization = Bearer {{token_admin}}
```

**Response**

```json
{
    "success": true,
    "message": "Kategori berhasil dihapus"
}
```

---

## FASE 6 — Validasi Input (Negative Tests)

### Uji 6.1 — Login Tanpa Body

```http
POST {{base_url}}/api/auth/login
```

**Response**

```json
{
    "success": false,
    "message": "[\n  {\n    \"code\": \"invalid_type\",\n    \"expected\": \"string\",\n    \"received\": \"undefined\",\n    \"path\": [\n      \"username\"\n    ],\n    \"message\": \"Required\"\n  },\n  {\n    \"code\": \"invalid_type\",\n    \"expected\": \"string\",\n    \"received\": \"undefined\",\n    \"path\": [\n      \"password\"\n    ],\n    \"message\": \"Required\"\n  }\n]"
}
```

### Uji 6.2 — Register Username Terlalu Pendek

```http
POST {{base_url}}/api/auth/register
```

**Response**

```json
{
    "success": false,
    "message": "[\n  {\n    \"code\": \"too_small\",\n    \"minimum\": 3,\n    \"type\": \"string\",\n    \"inclusive\": true,\n    \"exact\": false,\n    \"message\": \"String must contain at least 3 character(s)\",\n    \"path\": [\n      \"username\"\n    ]\n  }\n]"
}
```

### Uji 6.3 — Create Item Harga Negatif

```http
POST {{base_url}}/api/items
Authorization = Bearer {{token_admin}}
```

```json
{
  "namaBarang": "Test",
  "categoryId": 1,
  "locationId": 1,
  "harga": -1000
}
```

**Response**

```json
{
    "success": false,
    "message": "[\n  {\n    \"code\": \"too_small\",\n    \"minimum\": 0,\n    \"type\": \"number\",\n    \"inclusive\": false,\n    \"exact\": false,\n    \"message\": \"Number must be greater than 0\",\n    \"path\": [\n      \"harga\"\n    ]\n  }\n]"
}
```

### Uji 6.4 — Update Item yang Tidak Ada (404)

```http
PUT {{base_url}}/api/items/99999
Authorization = Bearer {{token_admin}}
```

```json
{
  "namaBarang": "Ghost"
}
```

**Response**

```json
{
    "success": false,
    "message": "Data tidak ditemukan"
}
```

### Uji 6.5 — Route Tidak Dikenal (404)

```http
GET {{base_url}}/api/unknown
Authorization = Bearer {{token_admin}}
```

**Response**

```json
{
    "success": false,
    "message": "Route /api/unknown tidak ditemukan"
}
```

---

## FASE 7 — Health Check

### Uji 7.1 — Health Endpoint

```http
GET {{base_url}}/health
```

**Response**

```json
{
  "status": "ok"
}
```