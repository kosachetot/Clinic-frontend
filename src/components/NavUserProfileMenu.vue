<script lang="ts" setup>
import { useRouter } from 'vue-router'
import avatar from '@images/avatars/avatar-6.png'

type StoredUser = {
  id: number
  emp_id: number
  username: string
  level: string
}

const router = useRouter()
const user = ref<StoredUser | null>(null)

onMounted(() => {
  const stored = localStorage.getItem('user')

  user.value = stored ? JSON.parse(stored) : null
})

function logout() {
  localStorage.removeItem('user')
  router.push({ name: 'login' })
}
</script>

<template>
  <VAvatar class="cursor-pointer">
    <VImg :src="avatar" />

    <VMenu activator="parent">
      <VList>
        <VListItem
          v-if="user"
          :append-avatar="avatar"
        >
          <VListItemTitle>{{ user.username }}</VListItemTitle>
          <VListItemSubtitle>{{ user.level }}</VListItemSubtitle>
        </VListItem>
        <VDivider class="mt-2" />
        <VListItem
          v-for="item in [{ title: 'Home', icon: 'mdi-home-outline' },
                          { title: 'Profile', icon: 'mdi-account-outline' },
                          { title: 'Settings', icon: 'mdi-cog-outline' }]"
          :key="item.title"
          :value="item.title"
          :append-icon="item.icon"
        >
          <VListItemTitle>{{ item.title }}</VListItemTitle>
        </VListItem>
        <VDivider />
        <VListItem
          append-icon="mdi-logout"
          @click="logout"
        >
          <VListItemTitle>Logout</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </VAvatar>
</template>
