<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  where
} from 'firebase/firestore';
import type { IInterview } from '@/interfaces/interfaces';
import { useUserStore } from '@/stores/user';
import { useConfirm } from 'primevue/useconfirm';

const userStore = useUserStore();
const db = getFirestore();
const confirm = useConfirm();

const userId: string = userStore.userId;

const isLoading = ref<boolean>(true);
const interviews = ref<IInterview[]>([]);
const selectedFilterResult = ref<string>('');

const getAllInterviews = async <T extends IInterview>(isFilter?: boolean): Promise<T[]> => {
  let getData;

  if (isFilter) {
    getData = query(
      collection(db, `users/${userId}/interviews`),
      orderBy('createdAt', 'desc'),
      where('result', '==', selectedFilterResult.value)
    );
  } else {
    getData = query(collection(db, `users/${userId}/interviews`), orderBy('createdAt', 'desc'));
  }

  const listDocs = await getDocs(getData);

  return listDocs.docs.map((doc) => doc.data() as T)
}

const confirmRemoveInterview = async (id: string): Promise<void> => {
  confirm.require({
    header: 'Удаление собеседования',
    message: 'Вы хотите удалить собеседование?',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Отмена',
    acceptLabel: 'Удалить',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      isLoading.value = true;
      await deleteDoc(doc(db, `users/${userStore.userId}/interviews`, id));
      interviews.value = interviews.value.filter((interview) => id !== interview.id)
      isLoading.value = false
    }
  })
}

const submitFilter = async (): Promise<void> => {
  isLoading.value = true;
  interviews.value = await getAllInterviews(true);
  isLoading.value = false;
}

const clearFilter = async (): Promise<void> => {
  isLoading.value = true;
  interviews.value = await getAllInterviews();
  isLoading.value = false;
}

onMounted(async () => {
  interviews.value = await getAllInterviews();
  isLoading.value = false;
})
</script>

<template>
  <PConfirmDialog />
  <PProgressSpinner v-if="isLoading" class="flex align-item-center"/>
  <div v-else>
    <h1>Список собеседований</h1>
    <div class="flex align-items-center mb-3 gap-3">
      <div class="flex align-items-center gap-2">
        <PRadio v-model="selectedFilterResult" inputId="interviewResult1" name="result" value="refusal"/>
        <label for="interviewResult1">Отказ</label>
      </div>
      <div class="flex align-items-center gap-2">
        <PRadio v-model="selectedFilterResult" inputId="interviewResult2" name="result" value="offer"/>
        <label for="interviewResult2">Оффер</label>
      </div>
      <PButton label="Применить" :disabled="!selectedFilterResult" @click="submitFilter" />
      <PButton severity="danger" label="Сбросить" @click="clearFilter" />
    </div>
    <PDataTable :value="interviews">
      <PColumn field="company" header="Компания"></PColumn>
      <PColumn field="hrName" header="Имя HR"></PColumn>
      <PColumn field="vacancyLink" header="Вакансия">
        <template #body="slotProps">
          <a :href="slotProps.data.vacancyLink" target="_blank">
            Ссылка на вакансию
          </a>
        </template>
      </PColumn>
      <PColumn header="Контакты">
        <template #body="slotProps">
          <div class="contacts">
            <a v-if="slotProps.data.contactTelegram" :href="`https://t.me/${slotProps.data.contactTelegram}`" target="_blank" class="contacts__telegram">
              <span class="contacts__icon pi pi-telegram"></span>
            </a>
            <a v-if="slotProps.data.contactWhatsApp" :href="`https://wa.me/${slotProps.data.contactWhatsApp}`" target="_blank" class="contacts__whatsapp">
              <span class="contacts__icon pi pi-whatsapp"></span>
            </a>
            <a v-if="slotProps.data.contactPhone" :href="`tel:${slotProps.data.contactPhone}`" class="phone">
              <span class="contacts__icon pi pi-phone"></span>
            </a>
          </div>
        </template>
      </PColumn>
      <PColumn header="Зарплатная вилка">
        <template #body="slotProps">
          <span v-if="slotProps.data.salaryFrom">{{ slotProps.data.salaryFrom }} - {{ slotProps.data.salaryTo }}</span>
          <span v-else>Нет</span>
        </template>
      </PColumn>
      <PColumn header="Пройденные этапы">
        <template #body="slotProps">
          <span v-if="!slotProps.data?.stages?.length">Нет</span>
          <div v-else class="interview-stages">
            <PBadge
              v-for="(stage, i) in slotProps.data.stages"
              :key="i"
              :value="i + 1"
              rounded
              v-tooltip.top="stage.name"
            />
          </div>
        </template>
      </PColumn>
      <PColumn header="Результат">
        <template #body="slotProps">
          <span v-if="!slotProps.data.result">Не выбрано</span>
          <template v-else>
            <PBadge
              :severity="slotProps.data.result === 'offer' ? 'success' : 'danger'"
              :value="slotProps.data.result === 'offer' ? 'Оффер' : 'Отказ'"
            />
          </template>
        </template>
      </PColumn>
      <PColumn>
        <template #body="slotProps">
          <div class="flex gap-2">
            <RouterLink :to="{ name: 'Interview', params: { id: slotProps.data.id } }">
              <PButton icon="pi pi-pencil" severity="info"></PButton>
            </RouterLink>
            <PButton icon="pi pi-trash" severity="danger" @click="confirmRemoveInterview(slotProps.data.id)"></PButton>
          </div>
        </template>
      </PColumn>
      <template #empty>
        <div class="text-center">Нет добавленных собеседований</div>
      </template>
    </PDataTable>
  </div>
</template>

<style scoped>
.contacts {
  display: flex;
  align-items: center;
  gap: 20px;
}

.contacts__telegram {
  color: #0088cc;
}

.contacts__whatsapp {
  color: #25d366;
}

.contacts__phone {
  color: #371777;
}

.contacts__icon {
  font-size: 20px;
}

.interview-stages {
  display: flex;
  gap: 5px;
}
</style>
