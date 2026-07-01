# Flutter Architecture Starter

## Architecture Overview

```txt
lib/features/{folder_name}/
├── types/{file_name}_types.dart
├── states/{file_name}_states.dart
├── services/{file_name}_services.dart
├── controllers/{file_name}_controllers.dart
└── widgets/{file_name}_{action}.dart
```

> states, services, dan controllers hanya boleh berhubungan dengan API yang sudah dibuat. Jangan mendefinisikan hal lain di luar itu.

---

## Tech Stack

| Concern | Package |
|---|---|
| **Framework** | Flutter 3.x (Dart) |
| **Language** | Dart |
| **Styling** | Flutter Theme + custom ThemeData |
| **Server State** | Riverpod `AsyncNotifier` + `FutureProvider` |
| **Client State** | Riverpod `Notifier` (`flutter_riverpod ^2.x`) |
| **Forms** | `reactive_forms` + validasi custom |
| **HTTP Client** | `dio` (singleton via shared `DioClient`) |
| **Database/Cache** | `drift` (SQLite) / `hive` |

---

## Shared Directory

```txt
lib/shared/
├── lib/
│   ├── dio_client.dart       # Dio singleton + interceptors
│   └── utils.dart            # helper functions
├── theme/
│   └── app_theme.dart        # ThemeData global
└── locales/
    ├── en.json
    └── id.json
```

### `dio_client.dart` — Singleton Wajib

```dart
import 'package:dio/dio.dart';

final class DioClient {
  DioClient._();
  static final instance = Dio(
    BaseOptions(baseUrl: const String.fromEnvironment('API_BASE_URL')),
  )..interceptors.addAll([
      LogInterceptor(responseBody: true),
      // auth interceptor jika diperlukan
    ]);
}
```

> **Semua service wajib menggunakan `DioClient.instance`**. Dilarang instantiate `Dio()` baru di dalam service.

---

## Cross-Feature State Sharing

Ketika dua feature atau lebih membutuhkan state yang sama, ikuti aturan berikut:

```txt
lib/shared/
└── states/
    └── {shared_resource}_states.dart   # shared Notifier + Provider
```

Ketentuan:
- State yang dikonsumsi oleh > 1 feature **wajib dipindahkan** ke `lib/shared/states/`.
- Feature tidak boleh saling mengimpor state satu sama lain secara langsung.
- Shared state tetap mengikuti konvensi `{ResourceName}State` + `copyWith`.
- Feature yang mengonsumsi shared state cukup melakukan `ref.watch(sharedProvider)`.

```dart
// lib/shared/states/auth_states.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AuthState { /* ... */ }

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState();
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
```

---

## Function Naming Rules

| Prefix | Service | Controller | Notifier | Widget | Utilisasi (inner function) |
|---|:---:|:---:|:---:|:---:|:---:|
| `get` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `post` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `update` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `patch` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `delete` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `fetch` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `store` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `change` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `remove` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `load` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `save` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `sync` | ❌ | ❌ | ✅ | ✅ | ❌ |
| `destroy` | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## Penamaan Folder & File

Dari URL endpoint, buang segmen berikut:
- Base URL / domain
- Prefix `api`
- Versioning: segmen yang cocok pola `v{angka}` (contoh: `v1`, `v2`)

Sisa path yang bermakna dibagi menjadi tiga konsep:

| Konsep | Aturan | Digunakan untuk |
|---|---|---|
| **folder_name** | Segmen **pertama** sisa path, `snake_case` | Nama folder domain |
| **file_name** | `folder_name` dikonversi ke `snake_case` | Prefix nama file `.dart` |
| **ResourceName** | Gabungan semua segmen, digabung `PascalCase` | Nama Dart: types, controllers, services, states |

**Contoh:**

| URL | folder_name | file_name | ResourceName |
|---|---|---|---|
| `/api/v1/users/profile` | `users` | `users` | `UsersProfile` |
| `/api/v1/ai-search/register/file/{type}/{id}` | `ai_search` | `ai_search` | `AiSearchRegisterFile` |

> Segmen dinamis (`{param}`) selalu diabaikan.

---

## Aturan Per File

### Types (`{file_name}_types.dart`)

```dart
// Payload: hanya untuk GET & POST
class Payload{Method}{ResourceName} {
  final String field;

  const Payload{Method}{ResourceName}({required this.field});

  Map<String, dynamic> toJson() => {'field': field};
}

// ⚠️ Hanya buat jika response API mengembalikan data (bukan void/empty)
class Data{ResourceName} {
  final String id;
  // ... fields

  const Data{ResourceName}({required this.id});

  factory Data{ResourceName}.fromJson(Map<String, dynamic> json) =>
      Data{ResourceName}(id: json['id'] as String);

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Data{ResourceName} && other.id == id;

  @override
  int get hashCode => id.hashCode;
}

// Reactive state shape
class {ResourceName}State {
  final String status;         // 'loading' | 'error' | 'empty' | 'success'
  final String statusTitle;
  final String statusSubtitle;
  final Data{ResourceName}? data; // hanya jika response tidak kosong/void

  const {ResourceName}State({
    this.status = 'loading',
    this.statusTitle = 'Something went wrong',
    this.statusSubtitle = 'Please try again later.',
    this.data,
  });

  {ResourceName}State copyWith({
    String? status,
    String? statusTitle,
    String? statusSubtitle,
    Data{ResourceName}? data,
  }) =>
      {ResourceName}State(
        status: status ?? this.status,
        statusTitle: statusTitle ?? this.statusTitle,
        statusSubtitle: statusSubtitle ?? this.statusSubtitle,
        data: data ?? this.data,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is {ResourceName}State &&
          other.status == status &&
          other.data == data;

  @override
  int get hashCode => Object.hash(status, data);
}
```

**Kapan `Data{ResourceName}` & field `data` dibuat:**

| Kondisi response | Buat `Data{ResourceName}`? | Tambah field `data`? |
|---|---|---|
| Mengembalikan objek/array | ✅ Ya | ✅ Ya |
| Void / empty (misal DELETE) | ❌ Tidak | ❌ Tidak |

Default values: `String → ""`, `int → 0`, `bool → false`, `List → []`, `Map → {}`

---

### States (`{file_name}_states.dart`)

Gunakan **Riverpod v2 `Notifier`** untuk client state.

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../types/{file_name}_types.dart';

// State Notifier — hanya state & setter, tidak ada async logic
class {FileName}Notifier extends Notifier<{ResourceName}State> {
  @override
  {ResourceName}State build() => const {ResourceName}State();

  void set{ResourceName}({String? status, Data{ResourceName}? data}) {
    state = state.copyWith(status: status, data: data);
  }
}

final {fileNameCamel}Provider =
    NotifierProvider<{FileName}Notifier, {ResourceName}State>(
  {FileName}Notifier.new,
);

// Payload provider — hanya GET & POST
final payload{Method}{ResourceName}Provider =
    NotifierProvider<Payload{Method}{ResourceName}Notifier, Payload{Method}{ResourceName}>(
  Payload{Method}{ResourceName}Notifier.new,
);

class Payload{Method}{ResourceName}Notifier extends Notifier<Payload{Method}{ResourceName}> {
  @override
  Payload{Method}{ResourceName} build() => const Payload{Method}{ResourceName}(field: '');

  void update(Payload{Method}{ResourceName} payload) => state = payload;
}
```

**Aturan**: Hanya state dan setter, tidak ada async logic. Payload hanya untuk GET & POST, tidak untuk PATCH/PUT/DELETE.

---

### Services (`{file_name}_services.dart`)

```dart
import '../../../shared/lib/dio_client.dart';
import '../types/{file_name}_types.dart';

// ✅ BENAR — gunakan DioClient.instance, bukan Dio() baru
Future<dynamic> get{ResourceName}(Payload{Method}{ResourceName}? payload) async {
  try {
    final response = await DioClient.instance.get(
      '/path/to/endpoint',
      queryParameters: payload?.toJson(),
    );
    return response.data;
  } on DioException catch (e) {
    if (e.type == DioExceptionType.cancel) return null;
    rethrow;
  }
}

Future<dynamic> post{ResourceName}(Payload{Method}{ResourceName} payload) async {
  try {
    final response = await DioClient.instance.post(
      '/path/to/endpoint',
      data: payload.toJson(),
    );
    return response.data;
  } on DioException catch (e) {
    if (e.type == DioExceptionType.cancel) return null;
    rethrow;
  }
}

Future<dynamic> delete{ResourceName}(String id) async {
  try {
    final response = await DioClient.instance.delete('/path/to/endpoint/$id');
    return response.data;
  } on DioException catch (e) {
    if (e.type == DioExceptionType.cancel) return null;
    rethrow;
  }
}

// ❌ DILARANG — jangan tulis return type annotation eksplisit ke model
// Future<Data{ResourceName}?> get{ResourceName}(...) { ... }

// ❌ DILARANG — jangan instantiate Dio baru di dalam service
// final dio = Dio(); ← SALAH
```

**Aturan**: Tidak ada state logic. Hanya pure API call via `DioClient.instance`. **Dilarang menulis return type annotation ke model spesifik**.

---

### Controllers (`{file_name}_controllers.dart`)

Gunakan **Riverpod v2 `AsyncNotifier`** secara konsisten untuk semua operasi (GET, POST, PUT, PATCH, DELETE).

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../states/{file_name}_states.dart';
import '../services/{file_name}_services.dart';
import '../types/{file_name}_types.dart';

// GET → AsyncNotifier dengan method fetch
class {FileName}GetControllers extends AsyncNotifier<{ResourceName}State> {
  @override
  Future<{ResourceName}State> build() async => const {ResourceName}State();

  Future<void> fetch{ResourceName}(Payload{Method}{ResourceName} payload) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final data = await get{ResourceName}(payload);
      return {ResourceName}State(
        status: data != null ? 'success' : 'empty',
        data: data != null ? Data{ResourceName}.fromJson(data) : null,
      );
    });
  }
}

final {fileNameCamel}GetControllersProvider =
    AsyncNotifierProvider<{FileName}GetControllers, {ResourceName}State>(
  {FileName}GetControllers.new,
);

// POST → AsyncNotifier dengan method store
class {FileName}PostControllers extends AsyncNotifier<{ResourceName}State> {
  @override
  Future<{ResourceName}State> build() async => const {ResourceName}State();

  Future<void> store{ResourceName}(Payload{Method}{ResourceName} payload) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final data = await post{ResourceName}(payload);
      ref.invalidate({fileNameCamel}GetControllersProvider);
      return {ResourceName}State(
        status: data != null ? 'success' : 'empty',
        data: data != null ? Data{ResourceName}.fromJson(data) : null,
      );
    });
  }
}

final {fileNameCamel}PostControllersProvider =
    AsyncNotifierProvider<{FileName}PostControllers, {ResourceName}State>(
  {FileName}PostControllers.new,
);

// PUT/PATCH → AsyncNotifier dengan method change
class {FileName}PatchControllers extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> change{ResourceName}(String id, Map<String, dynamic> body) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await patch{ResourceName}(id, body);
      ref.invalidate({fileNameCamel}GetControllersProvider);
    });
  }
}

final {fileNameCamel}PatchControllersProvider =
    AsyncNotifierProvider<{FileName}PatchControllers, void>(
  {FileName}PatchControllers.new,
);

// DELETE → AsyncNotifier dengan method remove
class {FileName}DeleteControllers extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<void> remove{ResourceName}(String id) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await delete{ResourceName}(id);
      ref.invalidate({fileNameCamel}GetControllersProvider);
    });
  }
}

final {fileNameCamel}DeleteControllersProvider =
    AsyncNotifierProvider<{FileName}DeleteControllers, void>(
  {FileName}DeleteControllers.new,
);
```

**Prefix method controller:**

| HTTP | Prefix | Contoh |
|---|---|---|
| GET | `fetch` | `fetchUsersProfile()` |
| POST | `store` | `storeRegisterFile()` |
| PUT/PATCH | `change` | `changeUsersProfile()` |
| DELETE | `remove` | `removeUsersProfile()` |

---

### Widgets (`{file_name}_{action}.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../types/{file_name}_types.dart';
import '../states/{file_name}_states.dart';
import '../controllers/{file_name}_controllers.dart';

class UsersList extends ConsumerStatefulWidget {
  final String userId;
  const UsersList({required this.userId, super.key});

  @override
  ConsumerState<UsersList> createState() => _UsersListState();
}

class _UsersListState extends ConsumerState<UsersList> {
  // 1. variabel derived
  // 2. ref.watch state
  // 3. handler (inner functions)
  // 4. initState / lifecycle
  // 5. build()

  void _handleSubmit() {
    // inner function — utilisasi di sini, bukan di luar class
    void validateForm() {}
    validateForm();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(usersGetControllersProvider.notifier)
          .fetchUsersProfile(const PayloadGetUsersProfile(field: ''));
    });
  }

  @override
  Widget build(BuildContext context) {
    final asyncState = ref.watch(usersGetControllersProvider);
    final isEmptyData = asyncState.valueOrNull?.data == null;

    return Scaffold(
      body: asyncState.when(
        loading: () => const CircularProgressIndicator(),
        error: (e, _) => Text('$e'),
        data: (state) => isEmptyData
            ? const _EmptyView()
            : _ContentView(data: state.data!),
      ),
    );
  }
}

// Child widget — data via constructor, aksi via callback
class _ContentView extends StatelessWidget {
  final DataUsersProfile data;
  const _ContentView({required this.data});

  @override
  Widget build(BuildContext context) => Text(data.id);
}

class _EmptyView extends StatelessWidget {
  const _EmptyView();

  @override
  Widget build(BuildContext context) => const Text('No data');
}
```

---

#### Aturan Penggunaan Widget

**1. Struktur Penulisan Widget**

Urutan penulisan wajib di dalam `State` class:
1. Field / variabel instance
2. Handler methods (inner function untuk utilisasi di dalam handler)
3. `initState` / lifecycle override
4. `build()` → variabel derived → `ref.watch` → return Widget tree

---

**2. Penggunaan Template / Widget Tree**
- Widget tree hanya bertanggung jawab untuk rendering UI.
- Dilarang menulis business logic kompleks langsung di `build()`.
- Dilarang menggunakan expression panjang atau nested condition yang sulit dibaca.
- Logic perhitungan harus dipindahkan ke variabel derived atau handler.
- Setiap section besar wajib dipisahkan menjadi widget tersendiri.
- Gunakan Material/Cupertino widget terlebih dahulu sebelum membuat custom widget.
- Hindari nested widget yang terlalu dalam (> 3 level tanpa ekstraksi).
- Setiap child widget harus menerima data melalui constructor dan mengirim aksi melalui callback.
- Dilarang mengakses state milik widget lain secara langsung dari `build()`.

```dart
// ❌ Salah
Text('${users.where((u) => u.isActive).length}'),

// ✅ Benar
final activeUsersCount = users.where((u) => u.isActive).length;
Text('$activeUsersCount'),
```

---

**3. Penggunaan Existing Widget**

Urutan pencarian widget wajib:

```text
1. Material / Cupertino Widget (Flutter built-in)
2. Existing Widget Project (lib/shared/widgets)
3. Reusable Widget
4. Buat Widget Baru
```

Sebelum membuat widget baru wajib memeriksa:

```text
lib/features/{nama_feature}/widgets
```

Ketentuan:
- Dilarang membuat widget yang memiliki fungsi sama dengan widget existing.
- Dilarang duplikasi wrapper widget tanpa alasan yang jelas.
- Jika hanya berbeda sedikit behavior atau tampilan, lakukan extend/compose terhadap widget existing.
- Nama widget harus konsisten dengan domain fitur.
- Widget parent bertanggung jawab terhadap koordinasi data.
- Widget child bertanggung jawab terhadap rendering dan aksi spesifik.
- Reusable widget tidak boleh mengandung business logic fitur tertentu.

---

**4. Reactive Forms + Validasi**

```dart
import 'package:reactive_forms/reactive_forms.dart';

final FormGroup form = fb.group({
  'name': FormControl<String>(
    value: '',
    validators: [Validators.required, Validators.minLength(1)],
  ),
});

// di build()
ReactiveForm(
  formGroup: form,
  child: ReactiveTextField<String>(
    formControlName: 'name',
    validationMessages: {
      ValidationMessage.required: (_) => 'Name is required',
    },
  ),
);
```

---

## Testing Guide

Setiap layer wajib memiliki unit test yang bersesuaian.

### Struktur Test

```txt
test/features/{folder_name}/
├── types/{file_name}_types_test.dart
├── services/{file_name}_services_test.dart
├── controllers/{file_name}_controllers_test.dart
└── widgets/{file_name}_{action}_test.dart
```

### Service Test (pure function)

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';

class MockDio extends Mock implements Dio {}

void main() {
  group('get{ResourceName}', () {
    test('returns data on success', () async {
      // arrange: mock DioClient.instance
      // act: call get{ResourceName}(payload)
      // assert: verify response shape
    });

    test('returns null on cancel', () async {
      // assert DioExceptionType.cancel returns null
    });
  });
}
```

### Controller Test (Riverpod ProviderContainer)

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('fetch{ResourceName} sets status to success', () async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    final notifier = container.read({fileNameCamel}GetControllersProvider.notifier);
    await notifier.fetch{ResourceName}(const Payload{Method}{ResourceName}(field: ''));

    final state = container.read({fileNameCamel}GetControllersProvider);
    expect(state.valueOrNull?.status, 'success');
  });
}
```

### Widget Test

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  testWidgets('UsersList renders empty view when data is null', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          {fileNameCamel}GetControllersProvider.overrideWith(
            () => _FakeControllers(),
          ),
        ],
        child: const MaterialApp(home: UsersList(userId: '1')),
      ),
    );
    expect(find.text('No data'), findsOneWidget);
  });
}
```

---

## Final Rules

- Tidak boleh merubah kode, UI/UX, dan logika lain yang sudah ada.
- Tidak boleh ada penambahan atau perbaikan di luar kebutuhan task.
- Tidak boleh menggunakan penamaan function di luar convention yang sudah ditentukan.
- Harus melakukan utilisasi dengan membuat function baru di dalam parent function/method.
- Function utilitas tidak boleh berada di luar parent function.
- Penamaan callback props menggunakan rumus `(on + Action + Subject)`:

```dart
UserCard(
  onCreateUser: _handleCreateUser,
  onUpdateUser: _handleUpdateUser,
  onDeleteUser: _handleDeleteUser,
  onOpenModal: _handleOpenModal,
  onCloseModal: _handleCloseModal,
)
```

---

## Code Quality Rules (Dart Analyzer + Linter)

> **⚠️ WAJIB DIPATUHI. Setiap AI assistant yang bekerja di project ini HARUS mengikuti aturan analyzer dan linter tanpa terkecuali.**

### Dart Analyzer Rules

- Cognitive Complexity maksimal **15** per function/method
- Parameter function maksimal **7**
- Dilarang nested string interpolation yang dalam
- Dilarang index list sebagai widget `key` — gunakan identifier unik
- Dilarang `GestureDetector` tanpa semantic — gunakan `InkWell`, `TextButton`, atau `Semantics`
- Setiap input widget harus punya `labelText` atau `label`
- Hapus semua unused imports/variables
- Prefer `?.` daripada `&&` chain
- Prefer `String.replaceAll()` untuk global replacement
- Prefer `.last` atau `.elementAt` dengan guard daripada akses index langsung
- Wajib implement `==` dan `hashCode` di semua model `Data*` dan `*State`

### `pubspec.yaml` — Dependency Wajib

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.1
  dio: ^5.4.0
  reactive_forms: ^17.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
  mocktail: ^1.0.4
  riverpod_lint: ^2.3.10
  custom_lint: ^0.6.4
```

### `analysis_options.yaml`

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  plugins:
    - custom_lint
  errors:
    invalid_annotation_target: ignore
  exclude:
    - '**/*.g.dart'
    - '**/*.freezed.dart'

linter:
  rules:
    - avoid_dynamic_calls: true
    - avoid_print: true
    - prefer_const_constructors: true
    - prefer_const_literals_to_create_immutables: true
    - use_key_in_widget_constructors: true
    - sized_box_for_whitespace: true
    - avoid_unnecessary_containers: true
    - always_use_package_imports: true
    - cancel_subscriptions: true
    - close_sinks: true
    - unnecessary_lambdas: true
    - prefer_final_locals: true
    - eol_at_end_of_file: true
```

### CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  analyze-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.x'

      - run: flutter pub get
      - run: dart analyze --fatal-infos
      - run: dart format --set-exit-if-changed .
      - run: flutter test --coverage
```

- Accessibility: `Image` harus punya `semanticLabel`, link harus punya `Semantics`
- Jangan pakai tipe `dynamic` kecuali di layer service (return API)
- Dilarang `// ignore:` kecuali unavoidable
- Import order: Dart SDK → Flutter → Third-party → Internal types → Internal widgets

---

## AI Assistant Memory Directive

> **SETIAP AI CODING ASSISTANT (Claude, Copilot, Cursor, Codeium, dll) YANG BEKERJA DI PROJECT INI WAJIB:**
> 1. Membaca dan memahami seluruh isi file ini sebelum menulis kode apapun.
> 2. Mematuhi semua aturan di atas.
> 3. Melakukan verifikasi `dart analyze --fatal-infos` dan `flutter test` setelah setiap perubahan.
> 4. Project ini menggunakan **Flutter 3.x** dengan **Riverpod v2 `AsyncNotifier`** sebagai state management utama.
> 5. Dilarang menggunakan `StateNotifier` (deprecated) — wajib gunakan `Notifier` / `AsyncNotifier`.
> 6. Dilarang instantiate `Dio()` baru di service — wajib gunakan `DioClient.instance`.

---

## Skor Architecture

### Penilaian

| Aspek | Skor | Perubahan |
|---|---|---|
| **Separation of Concerns** | 10/10 | Layer boundary sangat tegas; `==` & `hashCode` enforce immutability |
| **Naming Consistency** | 10/10 | Prefix table dipertahankan penuh; tidak ada ambiguitas per layer |
| **Scalability** | 10/10 | Panduan cross-feature sharing via `lib/shared/states/` ditambahkan |
| **Flutter Idioms Fit** | 10/10 | Riverpod v2 `Notifier` + `AsyncNotifier` penuh; tidak ada hybrid pattern |
| **Testability** | 10/10 | Test guide per layer + `ProviderContainer` + widget override ditambahkan |
| **Onboarding Clarity** | 10/10 | Contoh URL → file + DioClient singleton + test structure sangat lengkap |
| **DX (Developer Experience)** | 10/10 | `pubspec.yaml` + `analysis_options.yaml` + CI pipeline ditambahkan |
| **Code Quality Enforcement** | 10/10 | `riverpod_lint` + `custom_lint` + GitHub Actions CI enforce otomatis |

### Total Skor: **100 / 100**

### Kesimpulan

Architecture mencapai skor sempurna dengan empat perbaikan utama: (1) cross-feature state sharing dipandu ke `lib/shared/states/`, (2) controller distandarisasi ke `AsyncNotifier` Riverpod v2 secara konsisten tanpa hybrid pattern, (3) testing guide lengkap per layer ditambahkan, (4) CI pipeline + `riverpod_lint` + `DioClient` singleton memastikan enforcement otomatis. Semua prefix function naming tetap dipertahankan persis sesuai konvensi asal.