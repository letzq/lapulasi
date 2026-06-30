<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

interface Props {
  value: number
  max?: number
  height?: string
  title?: string
  unit?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  height: '200px',
  title: '',
  unit: '%'
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const getColor = (value: number, max: number) => {
  const percent = (value / max) * 100
  if (percent >= 80) return '#34c759'
  if (percent >= 60) return '#3370ff'
  if (percent >= 40) return '#ff9500'
  return '#f53f3f'
}

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    title: props.title ? {
      text: props.title,
      left: 'center',
      bottom: '5%',
      textStyle: {
        fontSize: 12,
        fontWeight: 400,
        color: '#86909c'
      }
    } : undefined,
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: props.max,
        center: ['50%', '55%'],
        radius: '90%',
        progress: {
          show: true,
          width: 12,
          itemStyle: {
            color: getColor(props.value, props.max)
          }
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [[1, '#f2f3f5']]
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '-10%'],
          fontSize: 24,
          fontWeight: 600,
          color: '#1f2329',
          formatter: `{value}${props.unit}`
        },
        data: [
          {
            value: props.value
          }
        ]
      }
    ]
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

watch(() => props.value, () => {
  initChart()
})
</script>

<template>
  <div ref="chartRef" :style="{ height }" />
</template>
