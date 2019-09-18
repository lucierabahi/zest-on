import axios from 'axios';
import { key, proxy } from '../config';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(
                `${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`
            );
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (error) {
            console.log(error);
            alert('Something went wrong :(');
        }
    }

    // Setup: 15 min of preparation/cooking for each 3 ingredients
    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    // Assuming a recipe is 4 servings
    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = [
            'tablespoons',
            'tablespoon',
            'ounces',
            'ounce',
            'teaspoons',
            'teaspoon',
            'cups',
            'pounds',
        ];
        const unitsShort = [
            'tbsp',
            'tbsp',
            'oz',
            'oz',
            'tsp',
            'tsp',
            'cup',
            'pound',
        ];

        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(element => {
            // 1. Uniform units
            let ingredient = element.toLowerCase();

            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // 2. Remove parentheses and text between
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3. Parse ingredients into count, unit and ingredient
            const ingArray = ingredient.split(' ');
            // Find index of unit when not knowing if and which unit we'll encounter...
            const unitIndex = ingArray.findIndex(el2 => units.includes(el2));

            let objIngredient;
            if (unitIndex > -1) {
                // There is a  unit
                // ex: 4 1/2 cups, arrCount[4, 1/2] ==> eval("4+1/2") ==> 4.5
                // ex: 4 cups, arrCount[4]
                const arrCount = ingArray.slice(0, unitIndex);
                let count;
                if (arrCount.length === 1) {
                    count = eval(ingArray[0].replace('-', '+'));
                } else {
                    count = eval(ingArray.slice(0, unitIndex).join('+'));
                }

                objIngredient = {
                    count,
                    unit: ingArray[unitIndex],
                    ingredient: ingArray.slice(unitIndex + 1).join(' '),
                };
            } else if (parseInt(ingArray[0], 10)) {
                // There is NO unit, but 1st element is a number
                objIngredient = {
                    count: parseInt(ingArray[0], 10),
                    unit: '',
                    ingredient: ingArray.slice(1).join(' '),
                };
            } else if (unitIndex === -1) {
                // There is NO unit and NO number in 1st position
                objIngredient = {
                    count: 1,
                    unit: '',
                    ingredient,
                };
            }

            return objIngredient;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        // Servings
        const newServings =
            type === 'dec' ? this.servings - 1 : this.servings + 1;

        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= newServings / this.servings;
        });

        this.servings = newServings;
    }
}
