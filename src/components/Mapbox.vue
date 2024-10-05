<template>
    <div id="map" ref="mapContainer" aria-label="Interactive map showing locations and routes" style="width: 100%; height: 100vh;"></div>
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
        endPoint: null,
        directionsClient: null,
      };
    },
    mounted() {
      // 设置 Mapbox 访问令牌
      // 在组件中使用
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  
      // 初始化地图
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [144.9631, -37.8136], // 初始中心设置为墨尔本 [经度, 纬度]
        zoom: 10,
      });
  
      // 添加地图控件（缩放和方向）
      this.map.addControl(new mapboxgl.NavigationControl());
  
      // 添加兴趣点搜索控件
      this.addGeocoder();
  
      // 初始化 Directions 客户端
      const mapboxClient = MapboxSdk({ accessToken: mapboxgl.accessToken });
      this.directionsClient = mapboxClient.directions;
  
      // 地图点击事件，用于选择起点和终点
      this.map.on('click', this.handleMapClick);

      const directionsService = MapboxDirections({ accessToken: mapboxgl.accessToken });
      this.directionsClient = directionsService;
    },
    methods: {
      addGeocoder() {
        // 初始化 Geocoder 控件
        this.geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          placeholder: 'Search for places',
          marker: false, // Do not add marker automatically
          language: 'en', // Set language to English
        });
  
        // 将 Geocoder 添加到地图控件中
        this.map.addControl(this.geocoder);
  
        // 监听搜索结果事件
        this.geocoder.on('result', (event) => {
          const coordinates = event.result.geometry.coordinates;
  
          // 添加标记到地图
          new mapboxgl.Marker()
            .setLngLat(coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setText(event.result.place_name)
            )
            .addTo(this.map);
  
          // 飞到搜索结果位置
          this.map.flyTo({ center: coordinates, zoom: 14 });
        });
      },
      handleMapClick(e) {
        const coordinates = [e.lngLat.lng, e.lngLat.lat];
          
        if (!this.startPoint) {
          // 设置起点
          this.startPoint = coordinates;
          this.startMarker = new mapboxgl.Marker({ color: 'green' })
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Start Point'))
            .addTo(this.map);
            
        } else if (!this.endPoint) {
          // 设置终点
          this.endPoint = coordinates;
          this.endMarker = new mapboxgl.Marker({ color: 'red' })
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('End Point'))
            .addTo(this.map);
      
          // 获取并显示路线
          this.getRoute(this.startPoint, this.endPoint);
        } else {
          // 重置路线并重新设置起点
          this.resetRoute();
          this.startPoint = coordinates;
          this.startMarker = new mapboxgl.Marker({ color: 'green' })
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('起点'))
            .addTo(this.map);
          this.endPoint = null;
        }
      },

      getRoute(start, end) {
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
            const route = response.body.routes[0];
  
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

          })
          .catch((error) => {
            console.error('Error fetching route:', error);
          });
      },
      resetRoute() {
        // 移除路线图层和数据源
        if (this.map.getLayer('route')) {
          this.map.removeLayer('route');
        }
        if (this.map.getSource('route')) {
          this.map.removeSource('route');
        }
        
        // 移除起点和终点标记
        // 我们需要跟踪并移除添加的标记
        if (this.startMarker) {
          this.startMarker.remove();
          this.startMarker = null;
        }
        if (this.endMarker) {
          this.endMarker.remove();
          this.endMarker = null;
        }
    
        // 重置起点和终点
        this.startPoint = null;
        this.endPoint = null;
      },

      beforeUnmount() {
      // 销毁地图实例
      if (this.map) this.map.remove();
      },
    }
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
  