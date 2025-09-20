<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import type { IInterview } from '@/interfaces/interfaces';
import { v4 as uuidv4 } from 'uuid';

import { useUserStore } from '@/stores/user';

const db = getFirestore();
const router = useRouter();

const company = ref<string>('');
const vacancyLink = ref<string>('');
const hrName = ref<string>('');
const contactTelegram = ref<string>('');
const contactWhatsApp = ref<string>('');
const contactPhone = ref<string>('');

const userStore = useUserStore()
const userId: string = userStore.userId

const isLoading = ref<boolean>(false);

const addNewInterview = async (): Promise<void> => {
  isLoading.value = true;

  const payload: IInterview = {
    id: uuidv4(),
    company: company.value,
    vacancyLink: vacancyLink.value,
    hrName: hrName.value,
    contactTelegram: contactTelegram.value,
    contactWhatsApp: contactWhatsApp.value,
    contactPhone: contactPhone.value,
    createdAt: new Date
  }

  if (userId) {
    await setDoc(doc(db, `users/${userId}/interviews`, payload.id), payload)
    .then(() => router.push('/list'))
  }

  isLoading.value = false;
}

const disabledSaveButton = computed<boolean>(() => {
  return !(company.value && vacancyLink.value && hrName.value);
})

</script>

<template>
  <div class="content-interview">
    <PCard>
      <template #title>Новое собеседование</template>
      <template #content>
        <PInputText
          class="input mb-3"
          placeholder="Компания"
          v-model="company"
        />
        <PInputText
          v-model="vacancyLink"
          class="input mb-3"
          placeholder="Описание вакансии (ссылка)"
        />
        <PInputText v-model="hrName" class="input mb-3" placeholder="Контакт (имя)" />
        <PInputText
          v-model="contactTelegram"
          class="input mb-3"
          placeholder="Telegram username HR"
        />
        <PInputText
          v-model="contactWhatsApp"
          class="input mb-3"
          placeholder="WhatsApp телефон HR"
        />
        <PInputText
          v-model="contactPhone"
          class="input mb-3"
          placeholder="Телефон HR"
        />
        <PButton
          @click="addNewInterview"
          label="Создать собеседование"
          :disabled="disabledSaveButton"
          :loading="isLoading"
          class="flex align-item-center"
        />
      </template>
    </PCard>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
}
.content-interview {
  max-width: 600px;
  margin: auto;
}
</style>
