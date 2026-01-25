<script setup>

</script>

<template>
  <button class="btn-gold" @click="$emit('buttonClicked')">
    <slot />
  </button>
</template>

<style scoped>
</style>