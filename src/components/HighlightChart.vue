<template>
  <div class="container-fluid">
    <div class="row justify-content-between align-items-center mt-4">
      <div class="col-11 col-md-9 col-lg-7">
        <div class="highlight-chart">
          <h3>Highlight</h3>
          <Chart type="line" :data="chartData" :options="chartOptions" class="responsive-chart" style="height: 430px;" />
        </div>
      </div>

      <div class="col-lg-5 col-md-11 mb-3 ml-3">
        <!-- Staff Chart Card --> 
        <div class="role-chart highlight-chart mb-2" style="padding: 40px 40px 0 40px">
          <!-- <h3>Staff</h3> -->
          <div class="row">
            <div class="col-5">
              <h4>Total Staff Number</h4>
              <h2>{{ staffCount }}</h2>
            </div>
            <div class="col-7 d-flex align-items-center justify-content-right">
              <Chart type="line" :data="staffChartData" :options="chartOptions" class="responsive-chart" style="height: 200px;" />
            </div>
          </div>
        </div>

        <div class="role-chart highlight-chart">
          <!-- <h3>Roles Distribution</h3> -->
          <div class="row">
            <div class="col-5">
              <h4>Total User Number</h4>
              <h2>{{ usersCount }}</h2>
            </div>
            <div class="col-6 d-flex align-items-center justify-content-right">
              <Chart type="doughnut" :data="rolesChartData" :options="chartOptions" class="doughnut-chart" style="height: 200px;" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/init.js';
import moment from 'moment';

export default {
  name: 'HighlightChart',
  setup() {
    const chartData = ref({});
    const rolesChartData = ref({}); // Data for the doughnut chart for roles
    const usersCount = ref(0); // Placeholder for earnings

    const adminCount = ref(0);
    const guestCount = ref(0);
    const userCount = ref(0);

    const staffChartData = ref({}); 
    const staffCount = ref(0); 

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
        const staffCountArray = [];
        const petsCountArray = [];

        for (let i = 0; i < 7; i++) {
          const day = new Date();
          day.setDate(startDate.getDate() + i);
          daysArray.push(moment(day).format('MMMM D'));

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
          staffCountArray.push(adoptersSnapshot.size);

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
              data: staffCountArray,
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

    const fetchUserRolesCount = async () => {
      try {
        const usersSnapshot = await getDocs(query(collection(db, 'users')));
        usersCount.value = usersSnapshot.size;

        let admin = 0;
        let guest = 0;
        let user = 0;

        usersSnapshot.forEach((doc) => {
          const role = doc.data().role;
          if (role === 'admin') admin++;
          if (role === 'guest') guest++;
          if (role === 'user') user++;
        });

        adminCount.value = admin;
        guestCount.value = guest;
        userCount.value = user;

        rolesChartData.value = {
          labels: ['Admin', 'Guest', 'User'],
          datasets: [
            {
              data: [adminCount.value, guestCount.value, userCount.value],
              backgroundColor: ['#3b82f6', '#10b981', '#ef4444'],
              hoverBackgroundColor: ['#60a5fa', '#34d399', '#f87171'],
            },
          ],
        };
      } catch (error) {
        console.error('Error fetching users count by role:', error);
      }
    };


    const fetchAdoptersForLastFiveDays = async () => {
      try {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 4); // 获取前五天

        const daysArray = [];
        const staffCountArray = [];

        for (let i = 0; i < 5; i++) {
          const day = new Date();
          day.setDate(startDate.getDate() + i);
          daysArray.push(moment(day).format('MMMM D'));

          const startOfDay = new Date(day.setHours(0, 0, 0, 0));
          const endOfDay = new Date(day.setHours(23, 59, 59, 999));

          // 查询当天的adopters数据
          const staffSnapshot = await getDocs(
            query(
              collection(db, 'staff'),
              where('createdAt', '>=', startOfDay),
              where('createdAt', '<=', endOfDay)
            )
          );
          staffCountArray.push(staffSnapshot.size);
        }

        // 准备chart数据
        staffChartData.value = {
          labels: daysArray,
          datasets: [
            {
              label: 'Staff',
              data: staffCountArray,
              borderColor: '#42A5F5',
              backgroundColor: 'rgba(66, 165, 245, 0.2)',
              fill: true,
            },
          ],
        };

        // 计算总数
        staffCount.value = staffCountArray.reduce((acc, curr) => acc + curr, 0);
      } catch (error) {
        console.error('Error fetching staff for the last five days:', error);
      }
    };


    onMounted(() => {
      fetchCountsForLastSevenDays();
      fetchUserRolesCount();
      fetchAdoptersForLastFiveDays();
    });

    return {
      chartData,
      chartOptions,
      rolesChartData,
      usersCount,

      staffChartData,
      staffCount,
    };
  },
};
</script>

<style scoped>
.container-fluid {
  max-width: 100%;
  padding: 20px;
}

.highlight-chart {
  padding: 40px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
}

.highlight-chart h3,
.role-chart h3 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 2em;
  /* Increased font size */
}

.responsive-chart {
  width: 100% !important;
  /* Full width responsiveness */
}

.doughnut-chart {
  height: 250px !important;
  width: 100% !important;
}

.role-chart .row {
  align-items: center;
}

.role-chart h2 {
  font-size: 2.5em;
  margin: 0;
}

.role-chart p {
  margin-top: 10px;
  color: #666;
  font-size: 0.9em;
}
</style>
