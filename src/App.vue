<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useAppPreload } from '@/composables/useAppPreload'

const { ensurePreload } = useAppPreload()

onLaunch(() => {
  ensurePreload()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import '@/styles/common.scss';

page {
  background-color: $color-bg;
  color: $color-text;
  font-family: $font-serif;
}
</style>
