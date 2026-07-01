# Development Standards

## Function Naming Rules

| Prefix      | Service | Controller | onMessage | emit | UI vue | Utilisasi (inner function) |
| ----------- | :-----: | :--------: | :-------: | :--: | :----: | :------------------------: |
| `get`       |   ✅    |     ❌     |     ❌    |  ❌  |   ❌   |             ✅              |
| `post`      |   ✅    |     ❌     |     ❌    |  ❌  |   ❌   |             ✅              |
| `update`    |   ✅    |     ❌     |     ❌    |  ❌  |   ❌   |             ✅              |
| `patch`     |   ✅    |     ❌     |     ❌    |  ❌  |   ❌   |             ✅              |
| `delete`    |   ✅    |     ❌     |     ❌    |  ❌  |   ❌   |             ✅              |
| `fetch`     |   ❌    |     ✅     |     ❌    |  ❌  |   ❌   |             ❌              |
| `store`     |   ❌    |     ✅     |     ❌    |  ❌  |   ❌   |             ❌              |
| `change`    |   ❌    |     ✅     |     ❌    |  ❌  |   ❌   |             ❌              |
| `remove`    |   ❌    |     ✅     |     ❌    |  ❌  |   ❌   |             ❌              |
| `load`      |   ❌    |     ❌     |     ✅    |  ✅  |   ✅   |             ❌              |
| `save`      |   ❌    |     ❌     |     ✅    |  ✅  |   ✅   |             ❌              |
| `sync`      |   ❌    |     ❌     |     ✅    |  ✅  |   ✅   |             ❌              |
| `destroy`   |   ❌    |     ❌     |     ✅    |  ✅  |   ✅   |             ❌              |

## Struktur Output

```
src/features/{folderName}/
├── types/{filename}Types.ts
├── states/{filename}States.ts
├── services/{filename}Services.ts
├── controllers/{filename}Controllers.ts
└── components/{filename}{action}.vue
```

---

## Penamaan Folder & File

Dari URL endpoint, buang segmen berikut:
- Base URL / domain
- Prefix `api`
- Versioning: segmen yang cocok pola `v{angka}` (contoh: `v1`, `v2`)

Sisa path yang bermakna dibagi menjadi tiga konsep:

| Konsep | Aturan | Digunakan untuk |
|--------|--------|-----------------|
| **folderName** | Segmen **pertama** sisa path, `kebab-case` | Nama folder domain |
| **fileName** | `folderName` dikonversi ke `camelCase` | Prefix nama file `.ts` |
| **resourceName** | gabungan semua segmen, digabung `PascalCase` | Nama TypeScript: types, controllers, handlers, services, states |

**Contoh:**

| URL | folderName | fileName | filename |
|-----|-----------|----------|--------------|
| `/api/v1/users/profile` | `users` | `users` | `UsersProfile` |
| `/api/v1/ai-search/register/file/{type}/{id}` | `ai-search` | `aiSearch` | `aiSearchRegisterFile` |

> Segmen dinamis (`{param}`) selalu diabaikan.

---

## Aturan Per File

### Types (`{filename}Types.ts`)

```typescript
// Payload: hanya untuk GET & POST
export interface Payload{Method}{resourceName} {
  field: type
}

// ⚠️ Hanya buat jika response API mengembalikan data (bukan void/empty)
export interface Data{resourceName} {
  id: string
  // ... fields
}

// Reactive state shape
export interface {resourceName} {
  status: string // loading | error | empty. selalu ada, tidak terkecuali
  statusTitle: string // selalu ada, tidak terkecuali
  statusSubtitle: string // selalu ada, tidak terkecuali
  data: Data{resourceName} | null  // hanya jika response tidak kosong/void
}
```

**Kapan `Data{resourceName}` & field `data` dibuat:**

| Kondisi response | Buat `Data{resourceName}`? | Tambah field `data`? |
|------------------|---------------------------|----------------------|
| Mengembalikan objek/array | ✅ Ya | ✅ Ya |
| Void / empty (misal DELETE) | ❌ Tidak | ❌ Tidak |

Default values: `string → ""`, `number → 0`, `boolean → false`, `Array → []`, `Object → {}`

---

### States (`{filename}States.ts`)

```typescript
import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { Payload{Method}{resourceName}, {resourceName} } from '../types/{filename}Types'

export const use{filename}States = defineStore('use{filename}States', () => {
  const payload{Method}{resourceName} = reactive<Payload{Method}{ResourceName}>({ /* empty defaults */ })

  const {camelResourceName} = reactive<{ResourceName}>({
    status: false,
    statusTitle: 'Something went wrong',               // tetap, tidak perlu disesuaikan
    statusSubtitle: 'Please try again later.',         // tetap, tidak perlu disesuaikan
    data: null                                        // hapus jika response void
  })

  return { payload{Method}{filename}, {camelResourceName} }
})
```

**Aturan**: Hanya `reactive` state, tidak ada fungsi. Payload hanya untuk GET & POST, tidak untuk PATCH/PUT/DELETE.

---

### Services (`{filename}Services.ts`)

```typescript
import { useApi } from '@/shared/hooks/useApi'
import { formattingQueryString } from '@/shared/utils/formData'
import type { Payload{Method}{resourceName} } from '../types/{filename}Types'

const api = useApi()
const baseUrl = import.meta.env.VITE_API_BASE_URL

// ✅ BENAR
export const {get|post|put|delete}{resourceName} = async (payload) => {
  try {
    const { data } = await api.{method}(
      `${baseUrl}/path/to/endpoint${formattingQueryString(payload)}`, // formattingQueryString hanya untuk GET
    )
    return data
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null
    throw error
  }
}

// ❌ DILARANG — jangan tulis return type
export const {get|post|put|delete}{resourceName} = async (payload): Promise<Data{resourceName} | null> => { ... }
```

**Aturan**: Tidak ada state logic. Hanya pure API call. **Dilarang menulis return type annotation** — tidak boleh ada `: Promise<...>` pada fungsi service.

---

### Store (`{filename}Controllers.ts`)

```typescript
import { defineStore } from 'pinia'
import { use{filename}Types } from '../states/{filename}Types'
import { use{filename}States } from '../states/{filename}States'
import { {method}{resourceName} } from '../service/{filename}Services'

export const use{filename}Controllers = defineStore('use{filename}Controllers, () => {
  const { {camelResourceName} } = use{filename}States()
  const { Payload{resourceName} } = use{filename}Types()

  const {fetch|store|update|remove}{resourceName} = async (payload: Payload{resourceName}, isStore = true) => {
    if (isStore) {camelResourceName}.status = 'loading'

    try {
      const result = await {method}{resourceName}(payload)

      {camelResourceName}.data = result ?? null // hapus jika response void
      {camelResourceName}.status = !!{camelResourceName}.data ? 'success' : 'empty' // hapus jika response void

      return result
    } catch (error) {
      {camelResourceName}.status = 'error'
      throw error
    }
  }

  return { {fetch|store|update|remove}{resourceName} }
})
```
**Aturan**: Hanya function yang memanggil function dari services, yang tidak memanggil function services, dipanggilnya pada component terkait secara langsung saja
**Prefix method store:**

| HTTP | Prefix | Contoh |
|------|--------|--------|
| GET | `fetch` | `fetchUsersProfile()` |
| POST | `store` | `storeRegisterFile()` |
| PUT/PATCH | `update` | `updateUsersProfile()` |
| DELETE | `remove` | `removeUsersProfile()` |

---

### Components (`{filename}{action}`)
```typescript
```

**Aturan**:

#### 1. Struktur Penulisan Kode Vue
Urutan penulisan wajib mengikuti struktur berikut:

```vue
<script setup lang="ts">
import { ref } from 'vue'

import type { User } from './types'
import { tableColumns } from './static/UserTable'
import { useUserState } from '/@src/states/user'
import { useUserHandler } from './handlers/useUserHandler'

const props = defineProps()

const emit = defineEmits()

const loading = ref(false)

const users = computed(() => [])

const handleSubmit = () => {}

watch(() => {}, () => {})

onMounted(() => {})
onUnmounted(() => {})
</script>

<template>
</template>

<style lang="scss">
@import "...";
</style>
```

---

#### 2. Penggunaan Template
- Template hanya bertanggung jawab untuk rendering UI.
- Dilarang menulis business logic kompleks langsung di template.
- Dilarang menggunakan expression yang panjang atau nested condition yang sulit dibaca.
- Logic perhitungan harus dipindahkan ke `computed`, `handler`, atau `composable`.
- Setiap section besar wajib dipisahkan menjadi komponen tersendiri.
- Gunakan komponen Vuero terlebih dahulu sebelum membuat elemen custom.
- Gunakan `v-if`, `v-for`, dan `v-slot` secara eksplisit dan mudah dibaca.
- Hindari nested template yang terlalu dalam (> 3 level).
- Setiap komponen child harus menerima data melalui props dan mengirim aksi melalui emits.
- Dilarang mengakses state milik komponen lain secara langsung dari template.

Contoh:

```vue
<!-- Salah -->
<div>
  {{ users.filter(user => user.active).length }}
</div>

<!-- Benar -->
<div>
  {{ activeUsersCount }}
</div>
```

---

#### 3. Penggunaan Existing Component
Urutan pencarian komponen wajib:

```text
1. Vuero Component
2. Existing Component Project
3. Reusable Component
4. Buat Component Baru
```

Sebelum membuat komponen baru wajib memeriksa:

```text
src/components/base
src/components/reusable
src/features/{nama_features}/components
```

Ketentuan:
- Dilarang membuat komponen yang memiliki fungsi sama dengan komponen existing.
- Dilarang melakukan duplikasi wrapper component tanpa alasan yang jelas.
- Jika hanya berbeda sedikit behavior atau tampilan, lakukan extend terhadap komponen existing.
- Props dan emits harus mengikuti pola komponen yang sudah ada.
- Nama komponen harus konsisten dengan domain fitur.
- Komponen parent bertanggung jawab terhadap koordinasi data.
- Komponen child bertanggung jawab terhadap rendering dan aksi spesifik.
- Reusable component tidak boleh mengandung business logic fitur tertentu.
- Feature component tidak boleh digunakan sebagai pengganti reusable component jika kebutuhan bersifat umum.
```
---

# Final Rules

- Tidak boleh merubah kode, UI/UX, dan logika lain yang sudah ada.
- Tidak boleh ada penambahan atau perbaikan diluar kebutuhan task.
- Tidak boleh menggunakan penamaan function diluar dari convention yang sudah ditentukan
- Harus melakukan utilisasi dengan membuat function baru di dalam parent function.
- Function utilitas tidak boleh berada di luar parent function.
- harus melakukan penamaan emit atupun onMessage dengan rumus (action + subject), berikut contohnya dan yang perlu diketahui adalah tidak selalu menggunakan prefix dari function naming rules
    emit('create-user') 
    emit('update-user')
    emit('delete-user')

    emit('open-modal')
    emit('close-modal')

    onMessage('create-user')
    onMessage('update-user')
    onMessage('delete-user')

    onMessage('open-modal')
    onMessage('close-modal')
---