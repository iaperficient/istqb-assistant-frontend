# ISTQB Assistant Frontend - Contexto del Proyecto

## 📋 Descripción General
Este es un frontend moderno en React + TypeScript para un chatbot especializado en certificaciones ISTQB (International Software Testing Qualifications Board). La aplicación se comunica con un backend FastAPI que funciona en `localhost:8000`.

## 🎯 Funcionalidades Principales

### 🔐 Autenticación
- **Login/Register**: Formularios completos con validación usando React Hook Form + Zod
- **JWT Token Management**: Manejo automático de tokens con renovación
- **Session Management**: Auto-logout cuando expira el token, notificaciones de sesión expirada
- **Protected Routes**: Rutas protegidas que redirigen al login si no está autenticado

### 💬 Chat Interface
- **Modern UI**: Diseño limpio y moderno con Tailwind CSS
- **Real-time Chat**: Interfaz de chat fluida con mensajes del usuario y del asistente
- **Voice Input**: Reconocimiento de voz para dictado (Web Speech API)
- **Suggestions**: Sugerencias de preguntas frecuentes sobre ISTQB
- **Loading States**: Indicadores de carga y estados de "escribiendo..."
- **Auto-scroll**: Scroll automático al final de la conversación
- **Responsive Design**: Adaptable a todos los dispositivos

## 🏗️ Arquitectura del Proyecto

### 📁 Estructura de Carpetas
```
src/
├── components/          # Componentes reutilizables
│   ├── ChatHeader.tsx   # Header del chat con info del usuario
│   ├── ChatInput.tsx    # Input de mensajes con voz
│   ├── ChatMessage.tsx  # Componente individual de mensaje
│   ├── LoginForm.tsx    # Formulario de login
│   ├── RegisterForm.tsx # Formulario de registro
│   └── ProtectedRoute.tsx # HOC para rutas protegidas
├── contexts/            # Contextos de React
│   └── AuthContext.tsx  # Manejo global de autenticación
├── hooks/               # Custom hooks
│   └── useChat.ts       # Hook para manejo del chat
├── pages/               # Páginas principales
│   ├── AuthPage.tsx     # Página de autenticación (login/register)
│   └── ChatPage.tsx     # Página principal del chat
├── services/            # Servicios y API
│   └── api.ts           # Cliente HTTP con Axios e interceptores
├── types/               # Definiciones de TypeScript
│   ├── api.ts           # Tipos para la API
│   └── chat.ts          # Tipos para el chat
└── utils/               # Utilidades
    └── cn.ts            # Utility para clases CSS (clsx + tailwind-merge)
```

### 🔧 Stack Tecnológico
- **React 18** + **TypeScript**: Framework principal
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Framework CSS utility-first
- **React Router DOM**: Routing
- **Axios**: Cliente HTTP con interceptores
- **React Hook Form**: Manejo de formularios
- **Zod**: Validación de esquemas
- **React Toastify**: Notificaciones
- **Lucide React**: Iconos modernos

## 🔌 Integración con Backend

### API Endpoints (localhost:8000)
- **POST /auth/register**: Registro de usuarios
- **POST /auth/login**: Login (form-data)
- **POST /chat/**: Envío de mensajes al chatbot
- **GET /health**: Health check

### 🔒 Autenticación
- Usa **OAuth2 Password Bearer** según el Swagger
- Token JWT almacenado en localStorage
- Interceptores de Axios para añadir automáticamente el Bearer token
- Manejo automático de renovación de tokens
- Logout automático en caso de token expirado (401)

### 📨 Formato de Mensajes
```typescript
// Envío al backend
{
  "message": "¿Qué es ISTQB?",
  "context": "optional context"
}

// Respuesta del backend
{
  "response": "ISTQB es...",
  "usage": { /* metadata opcional */ }
}
```

## 🎨 Diseño y UX

### 🎯 Características de Diseño
- **Color Scheme**: Azules primarios (#3b82f6) con grises neutros
- **Typography**: Inter font family
- **Animations**: Fade-in, slide-up suaves con CSS
- **Responsive**: Mobile-first design
- **Accessibility**: Contraste adecuado, focus states

### 💡 UX Features
- **Welcome Message**: Mensaje inicial del asistente
- **Typing Indicators**: Puntos animados mientras el asistente "escribe"
- **Voice Input**: Botón de micrófono para dictar mensajes
- **Quick Suggestions**: Preguntas sugeridas para comenzar
- **Session Feedback**: Notificaciones claras sobre el estado de la sesión

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Linting
npm run lint

# Preview del build
npm run preview
```

## 📝 Notas Importantes

### 🔧 Configuración
- **Backend URL**: Hardcodeado a `http://localhost:8000`
- **Token Storage**: localStorage (considerar cambiar a httpOnly cookies en producción)
- **CORS**: Debe estar configurado en el backend para permitir el frontend

### 🐛 Conocimientos para Debugging
- Los tokens se almacenan en `localStorage` con key `access_token`
- Los datos del usuario se almacenan en `localStorage` con key `user_data`
- Los interceptores de Axios manejan automáticamente los errores 401
- El evento `tokenExpired` se dispara cuando el token expira

### 🔄 Estado de Session Management
- **Login exitoso**: Guarda token + datos de usuario
- **Token expirado**: Limpia storage + redirige a login + muestra toast
- **Logout manual**: Limpia storage + muestra notificación
- **Refresh automático**: Implementado en interceptores (aunque el backend actual no parece tener endpoint de refresh)

### 🎤 Reconocimiento de Voz
- Solo funciona en navegadores que soporten Web Speech API
- Configurado para español (es-ES)
- Botón se deshabilita automáticamente si no hay soporte

## 🔮 Próximas Mejoras Sugeridas
1. **Persistencia de Chat**: Guardar historial de conversaciones
2. **Temas**: Modo oscuro/claro
3. **Export Chat**: Descargar conversaciones en PDF/texto
4. **File Upload**: Subir documentos relacionados con ISTQB
5. **Markdown Support**: Renderizar respuestas con formato
6. **Typing Speed**: Simular velocidad de escritura humana en respuestas
7. **Chat Rooms**: Múltiples conversaciones simultáneas
8. **Settings Panel**: Configuración de usuario personalizable

## 🤖 Contexto del Asistente ISTQB
El chatbot está especializado en:
- Certificaciones ISTQB (Foundation, Advanced, Expert)
- Técnicas de testing (caja negra, caja blanca, etc.)
- Metodologías de testing
- Herramientas de testing
- Preparación para exámenes ISTQB
- Conceptos de QA y testing de software

La interfaz está diseñada para ser profesional pero amigable, facilitando el aprendizaje y consulta de conceptos de testing.