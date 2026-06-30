<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

interface Props {
  data: {
    name: string
    value: number
  }[]
  height?: string
  title?: string
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  title: '',
  showLabel: true
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    title: props.title ? {
      text: props.title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 500,
        color: '#1f2329'
      }
    } : undefined,
    tooltip: {
      trigger: 'item',
      backgroundColor: '#ffffff',
      borderColor: '#e5e6eb',
      borderWidth: 1,
      textStyle: {
        color: '#1f2329'
      },
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        color: '#4e5969'
      }
    },
    series: [
      {
        name: props.title || '数据',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: props.showLabel,
          position: 'outside',
          color: '#4e5969'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 600
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        labelLine: {
          show: props.showLabel
        },
        data: props.data
      }
    ],
    color: ['#3370ff', '#34c759', '#ff9500', '#f53f3f', '#86909c', '#00ffff']
  }

  chart.setOption(option)
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', handleResize)
})

watch(() => props.data, () => {
  initChart()
}, { deep: true })
</script>

<template>
  <div ref="chartRef" :style="{ height }" />
</template>
