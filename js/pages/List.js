import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list">

            <div style="padding: 0 1rem 1rem 1rem;">
                <input 
                    v-model="searchQuery"
                    type="text"
                    placeholder="im gay"
                    class="search-bar"
                    style="width: 100%; padding: 0.7rem; border-radius: 0.5rem;
                           border: 2px solid var(--color-primary);
                           background: var(--color-background);
                           color: var(--color-on-background);"
                >
            </div>

            <div class="list-container">
                <table class="list" v-if="filteredList.length > 0">
                    <tr v-for="([level, err, realIndex], i) in filteredList">
                        <td class="rank">
                            <p class="type-label-lg" 
                                :style="{ color: realIndex + 1 > 75 ? 'darkgrey' : 'inherit' }">
                                #{{ realIndex + 1 }}
                            </p>
                        </td>

                        <td class="level" :class="{ 'active': selected == realIndex, 'error': !level }">
                            <button @click="selected = realIndex">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>

                <p v-else style="padding: 1rem; text-align: center; opacity: .6;">
                    No levels match your search owo...
                </p>
            </div>

            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>

                    <LevelAuthors :creators="level.creators" :verifier="level.verifier"></LevelAuthors>

                    <div style="display:flex">
                        <div v-for="tag in level.tags" class="tag">{{tag}}</div>
                    </div>

                    <!-- Hide video if empty -->
                    <iframe 
                        v-if="level.verification"
                        class="video" 
                        id="videoframe" 
                        :src="video" 
                        frameborder="0">
                    </iframe>

                    <p v-else style="opacity:.6; font-style:italic;">
                        No verification video available owo~
                    </p>

                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                    </ul>

                    <h2>Victors</h2>

                    <p v-if="selected + 1 > 75">
                        This level has fallen into the Legacy List and no longer accepts new records.
                    </p>

                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent"><p>{{ record.percent }}%</p></td>

                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">
                                    {{ record.user }}
                                </a>
                            </td>

                            <td class="mobile">
                                <img 
                                    v-if="record.mobile" 
                                    :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" 
                                    alt="Mobile">
                            </td>
                        </tr>
                    </table>
                </div>

                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>

            <div class="meta-container">
                <div class="meta">

                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>

                    <div class="og">
                        <p class="type-label-md">
                            Website layout made by 
                            <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a>
                        </p>
                    </div>

                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img 
                                    :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" 
                                    :alt="editor.role"
                                >
                                <a 
                                    v-if="editor.link" 
                                    class="type-label-lg link" 
                                    target="_blank" 
                                    :href="editor.link"
                                >
                                    {{ editor.name }}
                                </a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>

                    <h3>Level Rules</h3>
                    <p>The level has to be under 30 seconds.</p>
                    <p>For a level to place, it must be harder than the level placed at #75.</p>
                    <p>Anything using the Random Trigger must not affect the gameplay or visual difficulty.</p>
                    <p>Copying parts from a level outside the GDPS is NOT allowed.</p>
                    <p>Levels requiring more than 15 clicks per second are not allowed.</p>

                    <h3>Submission Requirements</h3>
                    <p>Video proof is required for Top 30 Challenges.</p>
                    <p>Verifications must be uploaded as YouTube videos.</p>
                    <p>Cheat indicator is required if a modmenu with that feature is used.</p>
                    <p>Recording must show previous attempt + death animation unless first try.</p>
                    <p>No major secret ways or bug routes.</p>
                    <p>Recording must show the complete screen.</p>
                    <p>FPS/TPS bypass allowed. Physics bypass NOT allowed.</p>
                </div>
            </div>

        </main>
    `,

    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        searchQuery: "",
        roleIconMap,
        store
    }),

    computed: {
        // ❀ Lista filtrada con el índice real incluido
        filteredList() {
            if (!this.searchQuery) {
                return this.list.map(([lvl, err], idx) => [lvl, err, idx]);
            }

            const q = this.searchQuery.toLowerCase();

            return this.list
                .map(([lvl, err], idx) => [lvl, err, idx])
                .filter(([lvl]) => lvl && lvl.name.toLowerCase().includes(q));
        },

        level() {
            return this.list[this.selected][0];
        },

        video() {
            if (!this.level.showcase) return embed(this.level.verification);

            return embed(
                this.toggledShowcase ? this.level.showcase : this.level.verification
            );
        },
    },

    async mounted() {
        this.list = await fetchList();
        this.editors = await fetchEditors();

        if (!this.list) {
            this.errors = ["Failed to load list. Try again later owo."];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => `Failed to load level. (${err}.json)`)
            );

            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },

    methods: {
        embed,
        score,
    },
};
