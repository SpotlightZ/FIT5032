<template>
  <div class="highlight-chart">
    <h3>Highlight</h3>
    <Chart type="line" :data="chartData" :options="chartOptions" />
  </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import { Chart } from 'primevue/chart';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/init.js';
import moment from 'moment';

export default {
  name: 'HighlightChart',
  components: {
    Chart,
  },
  setup() {
    const chartData = ref({});
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
    };

    const fetchCountsForLastSevenDays = async () => {
      try {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 6);

        const daysArray = [];
        const adoptersCountArray = [];
        const petsCountArray = [];

        for (let i = 0; i < 7; i++) {
          const day = new Date();
          day.setDate(startDate.getDate() + i);
          daysArray.push(moment(day).format('MMMM D, YYYY'));

          const startOfDay = new Date(day.setHours(0, 0, 0, 0));
          const endOfDay = new Date(day.setHours(23, 59, 59, 999));

          // Query for adopters added on this day
          const adoptersSnapshot = await getDocs(
            query(
              collection(db, 'adopters'),
              where('createdAt', '>=', startOfDay),
              where('createdAt', '<=', endOfDay)
            )
          );
          adoptersCountArray.push(adoptersSnapshot.size);

          // Query for pets added on this day
          const petsSnapshot = await getDocs(
            query(
              collection(db, 'pets'),
              where('createdAt', '>=', startOfDay),
              where('createdAt', '<=', endOfDay)
            )
          );
          petsCountArray.push(petsSnapshot.size);
        }

        // Prepare chart data
        chartData.value = {
          labels: daysArray,
          datasets: [
            {
              label: 'Adopters',
              data: adoptersCountArray,
              borderColor: '#42A5F5',
              backgroundColor: 'rgba(66, 165, 245, 0.2)',
              fill: true,
            },
            {
              label: 'Pets',
              data: petsCountArray,
              borderColor: '#66BB6A',
              backgroundColor: 'rgba(102, 187, 106, 0.2)',
              fill: true,
            },
          ],
        };
      } catch (error) {
        console.error('Error fetching counts for the last seven days:', error);
      }
    };

    onMounted(() => {
      fetchCountsForLastSevenDays();
    });

    return {
      chartData,
      chartOptions,
    };
  },
};
</script>
<style scoped>
.highlight-chart {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.highlight-chart h3 {
  text-align: center;
  margin-bottom: 20px;
}
</style>