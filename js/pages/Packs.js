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

        <div class="meta-container"></div>
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
    .map(ref => {
        const entry = this.list.find(([lvl]) => 
            lvl.id === ref || lvl.name.toLowerCase() === String(ref).toLowerCase()
        );

        if (!entry) {
            console.warn(`Level not found in list: ${ref}`);
            return null;
        }

        const [lvl] = entry;
        return {
            name: lvl.name,
            rank: this.list.indexOf(entry) + 1,
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
