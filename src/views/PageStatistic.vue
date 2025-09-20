<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import {
    getFirestore,
    collection,
    query,
    orderBy,
    getDocs,
  } from 'firebase/firestore';
  import type { IInterview } from '@/interfaces/interfaces';
  import { useUserStore } from '@/stores/user';

  const userStore = useUserStore();
  const db = getFirestore();

  const isLoading = ref<boolean>(true);
  const interviews = ref<IInterview[]>([]);

  const userId: string = userStore.userId;

  const chartData = ref();
  const chartOptions = ref();

  const getAllInterviews = async <T extends IInterview>(): Promise<T[]> => {
    const getData = query(collection(db, `users/${userId}/interviews`), orderBy('createdAt', 'desc'));
    const listDocs = await getDocs(getData);

    return listDocs.docs.map((doc) => doc.data() as T)
  }

  const setChartData = () => {
    const documentStyle = getComputedStyle(document.body);

    const data:number[] = [0, 0, 0];
    interviews.value.forEach((interview: IInterview) => {
      if (interview.result === 'offer') {
        data[0]++
      } else if (interview.result === 'refusal') {
        data[1]++
      } else {
        data[2]++
      }
    })

    return {
      labels: ['Оффер', 'Отказ', 'В процессе'],
      datasets: [
        {
          data,
          backgroundColor: [documentStyle.getPropertyValue('--p-cyan-500'), documentStyle.getPropertyValue('--p-orange-500'), documentStyle.getPropertyValue('--p-gray-500')],
          hoverBackgroundColor: [documentStyle.getPropertyValue('--p-cyan-400'), documentStyle.getPropertyValue('--p-orange-400'), documentStyle.getPropertyValue('--p-gray-400')]
        }
      ]
    };
  };

  const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    return {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor
          }
        }
      }
    };
  };

  onMounted(async () => {
    interviews.value = await getAllInterviews();

    chartData.value = setChartData();
    chartOptions.value = setChartOptions();

    isLoading.value = false;
  });
</script>

<template>
  <h1>Статистика</h1>
  <PProgressSpinner v-if="isLoading" class="flex align-item-center"/>
  <div v-else class="chart__wrapper">
    <PChart type="pie" :data="chartData" :options="chartOptions" class="md:w-[30rem]" />
  </div>
</template>

<style>
.chart__wrapper {
  display: flex;
  justify-content: center;
}
</style>
