import { fetchPacks, fetchList } from '../content.js';
import { getThumbnailFromId, getYoutubeIdFromUrl } from '../util.js';

import Spinner from '../components/Spinner.js';
import Btn from '../components/Btn.js';

export default {
    components: { Spinner, Btn },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-packs">
            <div class="packs-header">
                <h1>Packs</h1>
                <p class="type-label-md" style="color: #aaa">
                    Collection of themed level packs from the list.
                </p>
            </div>

            <section class="packs-container">
                <div class="packs-grid">
                    <div class="pack-card" v-for="(pack, i) in packs" :key="i">
                        <div class="pack-image">
                            <img v-if="pack.image" :src="pack.image" :alt="pack.name">
                            <img v-else src="/assets/placeholder-pack.png" alt="Pack image">
                        </div>
                        <div class="pack-meta">
                            <h2>{{ pack.name }}</h2>
                            <p class="type-label-sm" style="color: #aaa;">{{ pack.description }}</p>
                            <div class="pack-levels">
                                <h3>Levels</h3>
                                <ul>
                                    <li v-for="level in pack.levelObjects">
                                        <a class="type-label-lg link" :href="level.video" target="_blank">
                                            {{ level.name }}
                                        </a>
                                        <span style="color:#aaa">(#{{ level.rank }})</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="pack-reward" v-if="pack.reward">
                                <p><strong>Reward:</strong> {{ pack.reward }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div class="meta-container">
                <div class="meta">
                    <p class="type-label-md">
                        Section concept inspired by the <a href="https://matcool.github.io/extreme-demon-roulette/" target="_blank">Extreme Demon Roulette</a> UI.
                    </p>
                    <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        loading: true,
        packs: [],
        list: [],
    }),
    async mounted() {
        this.loading = true;

        // Fetch list and packs
        this.list = await fetchList();
        const packs = await fetchPacks();

        if (!packs || packs.length === 0) {
            console.error('No packs found.');
            this.loading = false;
            return;
        }

        // Attach level info from list to packs
        this.packs = packs.map(pack => {
            const levelObjects = pack.levels
                .map(rank => {
                    const entry = this.list[rank - 1]; // rank is 1-indexed
                    if (!entry) return null;
                    const [lvl] = entry;
                    return {
                        name: lvl.name,
                        rank,
                        id: lvl.id,
                        video: lvl.verification,
                        thumbnail: getThumbnailFromId(getYoutubeIdFromUrl(lvl.verification)),
                    };
                })
                .filter(Boolean);

            return {
                ...pack,
                levelObjects,
            };
        });

        this.loading = false;
    },
    methods: {
        getThumbnailFromId,
        getYoutubeIdFromUrl,
    },
};
