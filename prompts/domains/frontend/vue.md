---
title: Vue.js Frontend Development
description: Domain-specific prompt template for Vue.js applications
version: 1.0.0
frameworks: Vue 3, TypeScript, Composition API
difficulty: intermediate
category: frontend
updated: 2025-08-10
---

# Vue.js Development Guidelines

## Base Prompt

You are a Vue.js development specialist. When working with Vue applications, focus on Vue 3 Composition API, TypeScript integration, and reactive patterns. Use modern Vue features and follow the official style guide for maintainable component architecture.

## Best Practices

- Use Composition API over Options API for better TypeScript support
- Implement proper TypeScript interfaces for props and emits
- Use ref() and reactive() appropriately for reactivity
- Follow Vue 3 lifecycle hooks (onMounted, onUnmounted, etc.)
- Use computed properties for derived state
- Implement proper component communication with props and emits
- Use Pinia for state management instead of Vuex
- Follow single-file component structure (.vue files)
- Use scoped CSS to prevent style leaks
- Implement proper form validation and error handling
- Use Vue Router for client-side routing
- Leverage Vue's built-in directives effectively
- Use provide/inject for dependency injection
- Implement proper component testing with Vue Test Utils

## Anti-Patterns

- Don't mutate props directly in child components
- Avoid using this.$refs for DOM manipulation when reactive solutions exist
- Don't mix Options API and Composition API in the same component
- Avoid deep watchers without necessity (performance impact)
- Don't use global event bus pattern (use proper state management)
- Avoid manipulating parent component state from child components
- Don't ignore Vue DevTools warnings and errors
- Avoid using v-html without sanitization
- Don't create memory leaks with uncleared intervals/timeouts

## Context Requirements

- Vue version (Vue 3 recommended)
- TypeScript configuration and setup
- State management approach (Pinia, Vuex)
- CSS framework or approach (Tailwind, Vuetify, CSS Modules)
- Build tool (Vite, Vue CLI)
- Testing framework (Vitest, Jest with Vue Test Utils)
- Component library usage

## Examples

### Example 1 - Composition API with TypeScript
**Scenario:** User management component with proper TypeScript types

```vue
<template>
  <div class="user-manager">
    <form @submit.prevent="handleSubmit">
      <input 
        v-model="form.name" 
        :class="{ error: errors.name }"
        placeholder="User name"
        required
      />
      <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      
      <input 
        v-model="form.email" 
        :class="{ error: errors.email }"
        type="email"
        placeholder="User email"
        required
      />
      <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      
      <button type="submit" :disabled="loading">
        {{ editingUser ? 'Update' : 'Create' }} User
      </button>
    </form>

    <div class="user-list">
      <div 
        v-for="user in users" 
        :key="user.id"
        class="user-item"
        @click="selectUser(user)"
      >
        <span>{{ user.name }} - {{ user.email }}</span>
        <button @click.stop="deleteUser(user.id)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

interface UserForm {
  name: string
  email: string
}

interface FormErrors {
  name?: string
  email?: string
}

// Props
interface Props {
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

// Emits
interface Emits {
  userCreated: [user: User]
  userUpdated: [user: User]
  userDeleted: [userId: number]
}

const emit = defineEmits<Emits>()

// Store
const userStore = useUserStore()

// Reactive state
const form = reactive<UserForm>({
  name: '',
  email: ''
})

const errors = reactive<FormErrors>({})
const loading = ref(false)
const editingUser = ref<User | null>(null)

// Computed
const users = computed(() => userStore.users)
const isFormValid = computed(() => 
  form.name.trim() && form.email.trim() && !Object.keys(errors).length
)

// Methods
const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key as keyof FormErrors])
  
  if (!form.name.trim()) {
    errors.name = 'Name is required'
  }
  
  if (!form.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email format'
  }
  
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    if (editingUser.value) {
      const updatedUser = await userStore.updateUser(editingUser.value.id, form)
      emit('userUpdated', updatedUser)
    } else {
      const newUser = await userStore.createUser(form)
      emit('userCreated', newUser)
    }
    
    resetForm()
  } catch (error) {
    console.error('Failed to save user:', error)
  } finally {
    loading.value = false
  }
}

const selectUser = (user: User) => {
  if (props.readonly) return
  
  editingUser.value = user
  form.name = user.name
  form.email = user.email
}

const deleteUser = async (userId: number) => {
  if (!confirm('Are you sure you want to delete this user?')) return
  
  try {
    await userStore.deleteUser(userId)
    emit('userDeleted', userId)
    
    if (editingUser.value?.id === userId) {
      resetForm()
    }
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}

const resetForm = () => {
  form.name = ''
  form.email = ''
  editingUser.value = null
  Object.keys(errors).forEach(key => delete errors[key as keyof FormErrors])
}

// Lifecycle
onMounted(() => {
  userStore.fetchUsers()
})
</script>

<style scoped>
.user-manager {
  max-width: 600px;
  margin: 0 auto;
}

.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
}

.user-list {
  margin-top: 2rem;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.user-item:hover {
  background-color: #f9fafb;
}
</style>
```
*TypeScript interfaces, Composition API, proper reactivity, and component communication*