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
                <h3>
                    About Packs
                </h3>
                <p>
                    These level packs are chosen by the list staff team. You will be able to unlock and display these packs directly on your profile.
                </p>
                <h3>
                    How can I obtain these packs?
                </h3>
                <p>
                    You need to beat all the levels in each pack and submit your records for them to be added to the list. Once the completion of all levels has been accepted, the packs will automatically appear on your profile.
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
