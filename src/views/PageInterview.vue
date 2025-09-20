<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
  import { useUserStore } from '@/stores/user';
  import type { IInterview, IStage } from '@/interfaces/interfaces';

  const db = getFirestore();
  const userStore = useUserStore();
  const route = useRoute();

  const isLoading = ref<boolean>(true);
  const interview = ref<IInterview | null>(null)

  const docref = doc(db, `users/${userStore.userId}/interviews`, route.params.id as string);

  const getInterviewData = async (): Promise<void> => {
    isLoading.value = true;
    const docSnap = await getDoc(docref);

    if (docSnap.exists()) {
      const data = docSnap.data() as IInterview;

      if (data?.stages?.length) {
        data.stages = data.stages.map((stage: IStage) => {
          if (stage.date && stage.date instanceof Timestamp) {
            return {
              ...stage,
              date: stage.date.toDate(),
            }
          }
          return stage;
        })
      }

      interview.value = data;
    }

    isLoading.value = false;
  }

  const addStage = async (): Promise<void> => {
    if (interview.value) {
      if (!interview.value.stages) {
        interview.value.stages = [];
      }

      interview.value.stages.push({
        name: '',
        date: null,
        description: '',
      })
    }
  }

  const removeStage = async (index: number): Promise<void> => {
    if (interview.value) {
      interview.value.stages?.splice(index, 1);
    }
  }

  const saveInterview = async (): Promise<void> => {
    isLoading.value = true;

    await updateDoc(docref, {...interview.value} );
    await getInterviewData();
    isLoading.value = false;
  }

  onMounted(async () => {
    await getInterviewData();
  })
</script>

<template>
  <PProgressSpinner v-if="isLoading" class="flex align-item-center"/>
  <div v-else-if="interview && !isLoading" class="content-interview">
    <PCard>
      <template #title>Собеседование в компанию {{ interview.company }}</template>
      <template #content>
        <div class="flex flex-column gap-2">
          <label for="company">Компания</label>
          <PInputText id="company" v-model="interview.company" class="input mb-3" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="vacancyLink">Описание вакансии (ссылка)</label>
          <PInputText id="vacancyLink" v-model="interview.vacancyLink" class="input mb-3" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="hrName">Контакт (имя)</label>
          <PInputText id="hrName" v-model="interview.hrName" class="input mb-3" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactTelegram">Telegram username HR</label>
          <PInputText id="contactTelegram" v-model="interview.contactTelegram" class="input mb-3" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactWhatsApp">WhatsApp HR</label>
          <PInputText id="contactWhatsApp" v-model="interview.contactWhatsApp" class="input mb-3" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactPhone">Телефон HR</label>
          <PInputText id="contactPhone" v-model="interview.contactPhone" class="input mb-3" />
        </div>

        <div class="flex flex-wrap gap-3 p-fluid mb-3">
          <div class="flex-auto">
            <PInputNumber v-model="interview.salaryFrom" inputId="salaryFrom" placeholder="Зарплатная вилка (от)" />
          </div>
          <div class="flex-auto">
            <PInputNumber v-model="interview.salaryTo" inputId="salaryTo" placeholder="Зарплатная вилка (до)" />
          </div>
        </div>

        <PButton label="Добавить этап" severity="info" icon="pi pi-plus" class="mb-3" @click="addStage" />

        <template v-if="interview.stages">
          <div v-for="(stage, index) in interview.stages" :key="index" class="interview-stage">
            <div class="flex flex-column gap-2">
              <label :for="'stageName' + index">Название этапа</label>
              <PInputText :id="'stageName' + index" v-model="stage.name" class="input mb-3" />
            </div>
            <div class="flex flex-column gap-2">
              <label :for="'stageDate' + index">Дата прохождения этапа</label>
              <PDatePicker :id="'stageDate' + index" v-model="stage.date" class="input mb-3" date-format="dd.mm.yy" />
            </div>
            <div class="flex flex-column gap-2">
              <label :for="'stageDescription' + index">Комментарий</label>
              <PTextarea :id="'stageDescription' + index" v-model="stage.description" class="input mb-3" rows="5" style="resize: none"/>
            </div>
            <PButton severity="danger" label="Удалить этап" @click="removeStage(index)"/>
          </div>
        </template>

        <div class="flex flex-wrap gap-3 mb-3">
          <div class="flex align-items-center gap-2">
            <PRadio v-model="interview.result" inputId="interviewResult1" name="result" value="refusal"/>
            <label for="interviewResult1">Отказ</label>
          </div>
          <div class="flex align-items-center gap-2">
            <PRadio v-model="interview.result" inputId="interviewResult2" name="result" value="offer"/>
            <label for="interviewResult2">Оффер</label>
          </div>
        </div>

        <PButton label="Сохранить" icon="pi pi-save" severity="success" @click="saveInterview" />
      </template>
    </PCard>
  </div>
</template>

<style scoped>
.content-interview {
  max-width: 600px;
  margin: auto;
}
.input {
  width: 100%;
}
.interview-stage {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
}
</style>
