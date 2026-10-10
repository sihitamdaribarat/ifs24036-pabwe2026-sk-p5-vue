<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { Clock, ImageOff, Trash2, Users } from "lucide-vue-next";
import { formatCountdown, formatRupiah, getHighestBid, isClosed } from "../../../helpers/toolsHelper";

const props = defineProps({
  aucation: { type: Object, required: true },
  isOwner: { type: Boolean, default: false },
  now: { type: Number, required: true },
});
const emit = defineEmits(["delete"]);

const closed = computed(() => isClosed(props.aucation.closed_at, props.now));
const highestBid = computed(() => getHighestBid(props.aucation.bids));
const bidCount = computed(() => props.aucation.bids?.length ?? 0);
</script>

<template>
  <article
    data-testid="aucation-card"
    class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <RouterLink :to="`/aucations/${aucation.id}`" class="relative block aspect-[4/3] bg-slate-100">
      <img
        v-if="aucation.cover"
        :src="aucation.cover"
        :alt="aucation.title"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
      <div v-else class="flex h-full flex-col items-center justify-center text-slate-400">
        <ImageOff class="h-10 w-10" />
        <span class="mt-1 text-xs">Belum ada cover</span>
      </div>
      <span
        :class="[
          'absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow',
          closed ? 'bg-slate-800/90 text-white' : 'bg-emerald-500 text-white',
        ]"
      >
        <Clock class="h-3.5 w-3.5" />
        {{ formatCountdown(aucation.closed_at, now) }}
      </span>
      <span
        v-if="isOwner"
        class="absolute right-3 top-3 rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow"
      >
        Milik Saya
      </span>
    </RouterLink>

    <div class="flex flex-1 flex-col p-4">
      <RouterLink :to="`/aucations/${aucation.id}`" class="line-clamp-1 font-semibold text-slate-900 hover:text-indigo-600">
        {{ aucation.title }}
      </RouterLink>
      <p class="mt-0.5 text-xs text-slate-500">oleh {{ aucation.author?.name ?? "Pengguna" }}</p>

      <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div class="rounded-lg bg-slate-50 p-2">
          <dt class="text-xs text-slate-500">Harga Awal</dt>
          <dd class="font-semibold text-slate-800">{{ formatRupiah(aucation.start_bid) }}</dd>
        </div>
        <div class="rounded-lg bg-emerald-50 p-2">
          <dt class="text-xs text-emerald-700">Tawaran Tertinggi</dt>
          <dd class="font-semibold text-emerald-700">
            {{ highestBid === null ? "-" : formatRupiah(highestBid) }}
          </dd>
        </div>
      </dl>

      <div class="mt-auto flex items-center justify-between pt-4">
        <span class="inline-flex items-center gap-1 text-xs text-slate-500">
          <Users class="h-3.5 w-3.5" /> {{ bidCount }} penawaran
        </span>
        <div class="flex items-center gap-1">
          <button
            v-if="isOwner"
            type="button"
            data-testid="card-delete"
            aria-label="Hapus lelang"
            class="grid h-8 w-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
            @click="emit('delete', aucation)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
          <RouterLink
            :to="`/aucations/${aucation.id}`"
            class="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            {{ closed || isOwner ? "Lihat Detail" : "Tawar" }}
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>
