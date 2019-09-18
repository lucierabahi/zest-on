import axios from 'axios';
import { key, proxy } from '../config';

// Get data from the API
export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        try {
            const res = await axios(
                `${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`
            );
            this.recipes = res.data.recipes;
        } catch (error) {
            alert(error);
        }
    }
}
