<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

interface Props {
  data: {
    xData: string[]
    series: {
      name: string
      data: number[]
    }[]
  }
  height?: string
  title?: string
  horizontal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  title: '',
  horizontal: false
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    title: props.title ? {
      text: props.title,
      textStyle: {
        fontSize: 14,
        fontWeight: 500,
        color: '#1f2329'
      }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#e5e6eb',
      borderWidth: 1,
      textStyle: {
        color: '#1f2329'
      },
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: props.data.series.map(s => s.name),
      bottom: 0,
      textStyle: {
        color: '#4e5969'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: props.title ? '15%' : '5%',
      containLabel: true
    },
    xAxis: {
      type: props.horizontal ? 'value' : 'category',
      data: props.horizontal ? undefined : props.data.xData,
      axisLine: {
        lineStyle: {
          color: '#e5e6eb'
        }
      },
      axisLabel: {
        color: '#86909c'
      },
      splitLine: props.horizontal ? {
        lineStyle: {
          color: '#f2f3f5'
        }
      } : undefined
    },
    yAxis: {
      type: props.horizontal ? 'category' : 'value',
      data: props.horizontal ? props.data.xData : undefined,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#86909c'
      },
      splitLine: props.horizontal ? undefined : {
        lineStyle: {
          color: '#f2f3f5'
        }
      }
    },
    series: props.data.series.map(s => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      barWidth: '40%',
      itemStyle: {
        borderRadius: props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
      }
    })),
    color: ['#3370ff', '#34c759', '#ff9500', '#f53f3f']
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
