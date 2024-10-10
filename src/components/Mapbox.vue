<template>
  <div
    id="map"
    ref="mapContainer"
    aria-label="Interactive map showing locations and routes"
    style="width: 100%; height: 100vh;"
  ></div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import MapboxSdk from '@mapbox/mapbox-sdk';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

export default {
  name: 'MapView',
  data() {
    return {
      map: null,
      geocoder: null,
      startPoint: null,
      directionsClient: null,
      fixedMarker: null, // 固定标记的引用
      startMarker: null,  // 起点标记的引用
      fixedPoint: [145.1346, -37.9105], // 固定终点坐标
    };
  },
  mounted() {
    // 设置 Mapbox 访问令牌
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    // 初始化地图
    this.map = new mapboxgl.Map({
      container: this.$refs.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.fixedPoint, // 初始中心设置为固定终点
      zoom: 12,
    });

    // 添加固定标记
    this.addFixedMarker();

    // 添加地图控件（缩放和方向）
    this.map.addControl(new mapboxgl.NavigationControl());

    // 添加兴趣点搜索控件
    this.addGeocoder();

    // 初始化 Directions 客户端
    // 注意：避免重复初始化 directionsClient
    this.directionsClient = MapboxDirections({ accessToken: mapboxgl.accessToken });

    // 地图点击事件，用于选择起点
    this.map.on('click', this.handleMapClick);
  },
  methods: {
    addFixedMarker() {
      // 创建固定标记
      this.fixedMarker = new mapboxgl.Marker({ color: 'blue' })
        .setLngLat(this.fixedPoint)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText('Older and Pets Center')
        )
        .addTo(this.map);

      // 可选：自动弹出弹窗
      this.fixedMarker.getPopup().addTo(this.map);
    },
    addGeocoder() {
      // 初始化 Geocoder 控件
      this.geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        placeholder: 'Search for places',
        marker: false, // 不自动添加标记
        language: 'en', // 设置语言为英文
      });

      // 将 Geocoder 添加到地图控件中
      this.map.addControl(this.geocoder);

      // 监听搜索结果事件
      this.geocoder.on('result', (event) => {
        const coordinates = event.result.geometry.coordinates;
        this.setStartPoint(coordinates);
      });
    },
    handleMapClick(e) {
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      this.setStartPoint(coordinates);
    },
    setStartPoint(coordinates) {
      // 如果已有起点标记，先移除
      if (this.startMarker) {
        this.startMarker.remove();
      }

      // 设置新的起点
      this.startPoint = coordinates;

      // 添加起点标记
      this.startMarker = new mapboxgl.Marker({ color: 'green' })
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Start Point'))
        .addTo(this.map);

      // 可选：自动弹出弹窗
      this.startMarker.getPopup().addTo(this.map);

      // 获取并显示路线
      this.getRoute(this.startPoint, this.fixedPoint);
    },
    getRoute(start, end) {
      // 调用 Directions API 获取路线
      this.directionsClient
        .getDirections({
          profile: 'driving',
          geometries: 'geojson',
          waypoints: [
            { coordinates: start },
            { coordinates: end },
          ],
        })
        .send()
        .then((response) => {
          // 检查响应是否包含路线
          if (
            response &&
            response.body &&
            response.body.routes &&
            response.body.routes.length
          ) {
            const route = response.body.routes[0];
            console.log('Route fetched:', route);

            // 如果之前已经有路线，先移除
            if (this.map.getSource('route')) {
              this.map.removeLayer('route');
              this.map.removeSource('route');
            }

            // 添加路线到地图
            this.map.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: route.geometry,
              },
            });

            this.map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#3887be',
                'line-width': 5,
              },
            });

            // 缩放地图以适应路线
            const bounds = new mapboxgl.LngLatBounds();
            route.geometry.coordinates.forEach((coord) => {
              bounds.extend(coord);
            });
            this.map.fitBounds(bounds, { padding: 50 });

            // 显示行程信息
            const distance = (route.distance / 1000).toFixed(2);
            const duration = (route.duration / 60).toFixed(2);
            alert(`Distance: ${distance} km\nEstimated time: ${duration} minutes`);
          } else {
            console.error('No route found in the response:', response);
            alert('No route found, please try another starting point.');
          }
        })
        .catch((error) => {
          console.error('Error fetching route:', error);
          alert('An error occurred while obtaining the route, check the console for more information.');
        });
    },
    beforeUnmount() {
      // 销毁地图实例
      if (this.map) this.map.remove();
    },
  },
};
</script>

<style scoped>
/* 确保地图容器充满页面 */
#map {
  position: relative;
  width: 100%;
  height: 100vh;
}
</style>
