<script lang="ts" setup>
import { useRouter } from 'vue-router'
import avatar from '@images/avatars/default-user.png'

interface StoredUser {
  id: number
  emp_id: number
  username: string
  level: string
  full_name?: string
  position?: string | null
  photo_url?: string | null
}

const router = useRouter()
const user = ref<StoredUser | null>(null)
const photoFailed = ref(false)

const photoSrc = computed(() =>
  !photoFailed.value && user.value?.photo_url ? user.value.photo_url : avatar,
)

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
    <VImg
      :src="photoSrc"
      @error="photoFailed = true"
    />

    <VMenu activator="parent">
      <VList>
        <VListItem v-if="user">
          <VListItemTitle>{{ user.full_name || user.username }}</VListItemTitle>
          <VListItemSubtitle>{{ user.position || user.level }}</VListItemSubtitle>

          <template #append>
            <VAvatar size="40">
              <VImg
                :src="photoSrc"
                @error="photoFailed = true"
              />
            </VAvatar>
          </template>
        </VListItem>
        <VDivider class="mt-2" />

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
