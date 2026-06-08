# EmprendeBot · Documentación de Componentes

## Stack

- **React 19** + **Vite 8** + **TypeScript 6**
- **React Router v7** — client-side routing
- **Mobile First** — max-width 480px centrado, `100svh`
- **Sin librerías de UI externas** — todos los componentes son propios

---

## Design Tokens (CSS Variables en `index.css`)

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#13ABA2` | Acciones principales, elementos clave |
| `--color-secondary` | `#2563EB` | Apoyos, header del chat, botón enviar |
| `--color-text-primary` | `#111B27` | Textos principales |
| `--color-text-secondary` | `#6C738E` | Textos secundarios, labels |
| `--color-border` | `#E5E7EB` | Bordes y divisores |
| `--color-bg` | `#FFFFFF` | Fondos |
| `--font-family` | `Poppins` | Toda la app |

**Tipografía:** Poppins SemiBold/Bold para títulos, Regular para textos.

---

## Estructura de carpetas

```
src/
├── types/index.ts          — Tipos TypeScript (User, Business, Message, etc.)
├── context/
│   ├── AuthContext.tsx     — Autenticación (login, register, logout)
│   └── BusinessContext.tsx — CRUD del negocio, carga por slug
├── hooks/
│   └── useChat.ts          — Lógica de mensajes y respuestas del bot
├── components/
│   ├── ui/
│   │   ├── Button.tsx      — Botón (primary/secondary/ghost/outline, 3 tamaños)
│   │   ├── Input.tsx       — Campo de texto con label, error y hint
│   │   ├── Chip.tsx        — Chip de respuesta rápida (seleccionado/no seleccionado)
│   │   └── Avatar.tsx      — Avatar con iniciales o imagen
│   ├── layout/
│   │   └── Drawer.tsx      — Menú lateral deslizante con overlay
│   ├── chat/
│   │   ├── ChatHeader.tsx      — Header del chat (nombre, estado online, acciones)
│   │   ├── MessageBubble.tsx   — Burbuja de mensaje (bot/usuario) + TypingIndicator
│   │   ├── QuickReplies.tsx    — Chips de opciones rápidas
│   │   └── ChatInput.tsx       — Input + botón enviar del chat
│   └── dashboard/
│       └── StatCard.tsx    — Tarjeta de estadística con ícono, valor y descripción
└── pages/
    ├── SplashPage.tsx         — Pantalla de carga (2.2s → /presentacion)
    ├── PresentationPage.tsx   — Bienvenida + CTA login/registro
    ├── LoginPage.tsx          — Formulario de inicio de sesión
    ├── RegisterPage.tsx       — Formulario de registro + selección de rubro
    ├── BusinessConfigPage.tsx — Config inicial y edición del negocio
    ├── DashboardPage.tsx      — Panel del emprendedor con stats y drawer
    └── ChatbotPage.tsx        — Chat público en /:slug
```

---

## Componentes UI

### `<Button>`

```tsx
<Button variant="primary" size="lg" fullWidth loading={false} onClick={...}>
  CREAR CUENTA
</Button>
```

Props: `variant` (primary | secondary | ghost | outline), `size` (sm | md | lg), `fullWidth`, `loading`, más todos los atributos nativos de `<button>`.

---

### `<Input>`

```tsx
<Input
  label="Email"
  type="email"
  placeholder="nombre@correo.com"
  value={email}
  onChange={e => setEmail(e.target.value)}
  error="Email inválido"
  hint="Usaremos este email para notificarte"
/>
```

Props: `label`, `error`, `hint`, más todos los atributos nativos de `<input>`.

---

### `<Chip>`

```tsx
<Chip selected={false} onClick={() => sendMessage('Consultar productos')}>
  Consultar productos
</Chip>
```

Props: `selected` (boolean), más atributos nativos de `<button>`.

---

### `<Avatar>`

```tsx
<Avatar name="Marina García" src="/logo.png" size={40} bgColor="var(--color-primary)" />
```

Si no hay `src`, muestra las iniciales del nombre con fondo de color.

---

### `<StatCard>`

```tsx
<StatCard
  label="Esperan respuesta"
  value={3}
  description="Consultas que necesitan tu atención"
  color="#ef4444"
  icon="💬"
/>
```

---

### `<Drawer>`

```tsx
<Drawer
  business={business}
  isOpen={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  activeItem="dashboard"
/>
```

Items disponibles: `dashboard`, `consultas`, `catalogo`, `faq`, `configuracion`.

---

## Componentes de Chat

### `<ChatHeader>`

```tsx
<ChatHeader
  business={business}
  onRefresh={() => reset()}
  onClose={() => navigate(-1)}
/>
```

---

### `<MessageBubble>` y `<TypingIndicator>`

```tsx
<MessageBubble message={message} />
<TypingIndicator />   // animación de puntos mientras el bot responde
```

---

### `<QuickReplies>`

```tsx
<QuickReplies
  options={['Consultar productos', 'Hablar con una persona']}
  onSelect={(text) => sendMessage(text)}
/>
```

---

### `<ChatInput>`

```tsx
<ChatInput onSend={(text) => sendMessage(text)} disabled={isTyping} />
```

---

## Rutas

| Ruta | Página | Protegida |
|---|---|---|
| `/` | SplashPage | No |
| `/presentacion` | PresentationPage | No |
| `/login` | LoginPage | No |
| `/registro` | RegisterPage | No |
| `/configurar` | BusinessConfigPage | Sí |
| `/dashboard` | DashboardPage | Sí |
| `/:slug` | ChatbotPage | No (pública) |

---

## Hooks

### `useChat(business)`

```ts
const { messages, isTyping, sendMessage, reset } = useChat(business)
```

Maneja el estado de la conversación, genera respuestas del bot en base a la configuración del negocio (productos, FAQ, horario, teléfono, mensaje de derivación).

---

## Contextos

### `AuthContext`

```ts
const { user, isLoading, login, register, logout } = useAuth()
```

### `BusinessContext`

```ts
const { business, stats, loadBusiness, loadBusinessBySlug, saveBusiness, updateBusiness } = useBusiness()
```

---

## Próximos pasos sugeridos

1. **Integración con backend** — reemplazar mocks de `localStorage` en `AuthContext` y `BusinessContext` por llamadas a la API del back (`maquetaChatbot`)
2. **Catálogo de productos** — página `/catalogo` para que el emprendedor gestione sus productos
3. **FAQ editor** — página `/faq` para cargar preguntas frecuentes
4. **Dashboard real** — conectar stats con datos reales del backend
5. **Upload de logo** — integrar storage en `BusinessConfigPage`
6. **Tests** — agregar Vitest para los hooks y componentes críticos
