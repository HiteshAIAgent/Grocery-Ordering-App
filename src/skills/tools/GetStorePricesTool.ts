import { LuaTool } from "lua-cli";
import { z } from "zod";

// Helper function to generate prices for all stores (ASDA cheapest, Waitrose most expensive)
const createPriceList = (asda: number, tesco: number, sainsbury: number, waitrose: number) => ({
    asda: asda,
    tesco: tesco,
    sainsbury: sainsbury,
    waitrose: waitrose
});

// Comprehensive price database with 100+ items for UK stores
const PRICE_DATA: Record<string, { asda: number; tesco: number; sainsbury: number; waitrose: number }> = {
    // Fresh Fruits
    "apples": createPriceList(1.85, 1.95, 2.00, 2.30),
    "bananas": createPriceList(1.10, 1.15, 1.20, 1.40),
    "oranges": createPriceList(1.65, 1.75, 1.80, 2.00),
    "strawberries": createPriceList(2.50, 2.75, 2.90, 3.50),
    "blueberries": createPriceList(3.00, 3.25, 3.50, 4.50),
    "grapes": createPriceList(2.80, 3.00, 3.20, 4.00),
    "pears": createPriceList(1.90, 2.00, 2.10, 2.40),
    "peaches": createPriceList(2.40, 2.60, 2.80, 3.50),
    "plums": createPriceList(2.20, 2.40, 2.50, 3.20),
    "cherries": createPriceList(3.50, 3.80, 4.00, 5.00),
    "raspberries": createPriceList(3.20, 3.50, 3.70, 4.80),
    "mangoes": createPriceList(1.20, 1.30, 1.40, 1.80),
    "pineapple": createPriceList(1.50, 1.65, 1.75, 2.20),
    "kiwi": createPriceList(2.80, 3.00, 3.20, 4.00),
    "lemons": createPriceList(0.80, 0.90, 1.00, 1.30),
    "limes": createPriceList(0.75, 0.85, 0.95, 1.20),
    "avocado": createPriceList(1.50, 1.65, 1.80, 2.30),
    "melon": createPriceList(2.00, 2.20, 2.40, 3.00),
    "watermelon": createPriceList(3.00, 3.30, 3.50, 4.50),
    "pomegranate": createPriceList(1.80, 2.00, 2.20, 2.80),
    
    // Fresh Vegetables
    "tomatoes": createPriceList(1.40, 1.45, 1.50, 1.70),
    "potatoes": createPriceList(0.90, 0.95, 1.00, 1.20),
    "onions": createPriceList(0.70, 0.75, 0.80, 0.95),
    "carrots": createPriceList(0.65, 0.70, 0.75, 0.90),
    "broccoli": createPriceList(1.10, 1.20, 1.30, 1.60),
    "cauliflower": createPriceList(1.20, 1.30, 1.40, 1.80),
    "cabbage": createPriceList(0.85, 0.95, 1.00, 1.25),
    "lettuce": createPriceList(0.90, 1.00, 1.10, 1.40),
    "spinach": createPriceList(1.50, 1.65, 1.75, 2.20),
    "peppers": createPriceList(1.80, 1.95, 2.10, 2.60),
    "cucumber": createPriceList(0.70, 0.75, 0.80, 1.00),
    "mushrooms": createPriceList(1.40, 1.50, 1.60, 2.00),
    "courgette": createPriceList(1.00, 1.10, 1.20, 1.50),
    "aubergine": createPriceList(1.20, 1.30, 1.40, 1.80),
    "sweetcorn": createPriceList(0.80, 0.90, 1.00, 1.25),
    "peas": createPriceList(1.50, 1.65, 1.75, 2.20),
    "green beans": createPriceList(1.60, 1.75, 1.90, 2.40),
    "asparagus": createPriceList(2.50, 2.75, 3.00, 3.80),
    "sweet potato": createPriceList(1.40, 1.50, 1.60, 2.00),
    "garlic": createPriceList(0.60, 0.65, 0.70, 0.85),
    "ginger": createPriceList(1.80, 2.00, 2.20, 2.80),
    "celery": createPriceList(0.85, 0.95, 1.00, 1.25),
    
    // Meat & Poultry
    "chicken": createPriceList(4.20, 4.40, 4.50, 5.00),
    "chicken breast": createPriceList(5.50, 5.80, 6.00, 7.00),
    "chicken thighs": createPriceList(3.80, 4.00, 4.20, 4.80),
    "beef": createPriceList(6.50, 6.90, 7.20, 8.50),
    "beef mince": createPriceList(4.50, 4.80, 5.00, 6.00),
    "steak": createPriceList(8.00, 8.50, 9.00, 11.00),
    "pork": createPriceList(5.00, 5.30, 5.50, 6.50),
    "pork chops": createPriceList(5.50, 5.80, 6.00, 7.20),
    "lamb": createPriceList(7.50, 8.00, 8.50, 10.00),
    "bacon": createPriceList(3.50, 3.80, 4.00, 4.80),
    "sausages": createPriceList(2.80, 3.00, 3.20, 3.90),
    "salmon": createPriceList(6.00, 6.50, 7.00, 8.50),
    "cod": createPriceList(5.00, 5.40, 5.80, 7.00),
    "tuna": createPriceList(3.50, 3.80, 4.00, 4.90),
    "prawns": createPriceList(5.50, 6.00, 6.50, 8.00),
    "fish fingers": createPriceList(2.50, 2.70, 2.90, 3.50),
    
    // Dairy Products
    "milk": createPriceList(1.00, 1.10, 1.15, 1.30),
    "semi-skimmed milk": createPriceList(1.00, 1.10, 1.15, 1.30),
    "skimmed milk": createPriceList(1.00, 1.10, 1.15, 1.30),
    "whole milk": createPriceList(1.05, 1.15, 1.20, 1.35),
    "butter": createPriceList(2.30, 2.45, 2.50, 2.80),
    "cheese": createPriceList(2.80, 2.95, 3.00, 3.50),
    "cheddar cheese": createPriceList(3.20, 3.40, 3.60, 4.20),
    "mozzarella": createPriceList(2.50, 2.70, 2.90, 3.50),
    "feta cheese": createPriceList(2.80, 3.00, 3.20, 4.00),
    "eggs": createPriceList(2.00, 2.15, 2.20, 2.50),
    "yogurt": createPriceList(1.70, 1.75, 1.80, 2.10),
    "greek yogurt": createPriceList(2.20, 2.40, 2.60, 3.20),
    "cream": createPriceList(1.40, 1.50, 1.60, 2.00),
    "sour cream": createPriceList(1.30, 1.40, 1.50, 1.90),
    "cottage cheese": createPriceList(1.80, 1.95, 2.10, 2.60),
    
    // Bakery
    "bread": createPriceList(0.95, 1.05, 1.10, 1.25),
    "white bread": createPriceList(0.95, 1.05, 1.10, 1.25),
    "brown bread": createPriceList(1.10, 1.20, 1.25, 1.50),
    "wholemeal bread": createPriceList(1.20, 1.30, 1.35, 1.60),
    "baguette": createPriceList(0.85, 0.95, 1.00, 1.30),
    "croissant": createPriceList(1.80, 2.00, 2.20, 2.80),
    "bagels": createPriceList(1.50, 1.65, 1.80, 2.30),
    "rolls": createPriceList(0.90, 1.00, 1.05, 1.30),
    "pitta bread": createPriceList(0.95, 1.05, 1.10, 1.40),
    "naan bread": createPriceList(1.60, 1.75, 1.90, 2.40),
    
    // Pantry Staples
    "pasta": createPriceList(0.80, 0.85, 0.90, 1.10),
    "spaghetti": createPriceList(0.85, 0.90, 0.95, 1.15),
    "penne": createPriceList(0.80, 0.85, 0.90, 1.10),
    "rice": createPriceList(1.30, 1.35, 1.40, 1.60),
    "basmati rice": createPriceList(2.00, 2.20, 2.40, 3.00),
    "flour": createPriceList(1.00, 1.05, 1.10, 1.25),
    "plain flour": createPriceList(1.00, 1.05, 1.10, 1.25),
    "self-raising flour": createPriceList(1.10, 1.15, 1.20, 1.35),
    "sugar": createPriceList(0.85, 0.90, 0.95, 1.10),
    "caster sugar": createPriceList(1.40, 1.50, 1.60, 2.00),
    "brown sugar": createPriceList(1.30, 1.40, 1.50, 1.90),
    "olive oil": createPriceList(3.50, 3.80, 4.00, 5.00),
    "vegetable oil": createPriceList(2.20, 2.40, 2.60, 3.30),
    "sunflower oil": createPriceList(2.00, 2.20, 2.40, 3.00),
    "salt": createPriceList(0.50, 0.55, 0.60, 0.75),
    "black pepper": createPriceList(2.50, 2.70, 2.90, 3.60),
    "garlic powder": createPriceList(1.80, 2.00, 2.20, 2.80),
    "paprika": createPriceList(2.20, 2.40, 2.60, 3.30),
    "cumin": createPriceList(2.00, 2.20, 2.40, 3.00),
    "turmeric": createPriceList(1.90, 2.10, 2.30, 2.90),
    
    // Beverages
    "water": createPriceList(0.70, 0.75, 0.80, 0.95),
    "orange juice": createPriceList(1.80, 1.95, 2.10, 2.60),
    "apple juice": createPriceList(1.70, 1.85, 2.00, 2.50),
    "cranberry juice": createPriceList(2.20, 2.40, 2.60, 3.30),
    "lemonade": createPriceList(1.20, 1.30, 1.40, 1.80),
    "cola": createPriceList(2.00, 2.20, 2.40, 3.00),
    "beer": createPriceList(4.80, 4.95, 5.00, 5.50),
    "wine": createPriceList(7.50, 7.95, 8.00, 9.00),
    "red wine": createPriceList(8.00, 8.50, 9.00, 11.00),
    "white wine": createPriceList(7.50, 8.00, 8.50, 10.00),
    "coffee": createPriceList(4.30, 4.40, 4.50, 5.00),
    "ground coffee": createPriceList(4.50, 4.80, 5.00, 6.20),
    "coffee beans": createPriceList(5.00, 5.50, 6.00, 7.50),
    "tea": createPriceList(2.35, 2.45, 2.50, 3.00),
    "green tea": createPriceList(2.50, 2.70, 2.90, 3.60),
    "herbal tea": createPriceList(2.60, 2.80, 3.00, 3.80),
    
    // Cereals & Breakfast
    "cereal": createPriceList(2.35, 2.45, 2.50, 3.00),
    "cornflakes": createPriceList(1.80, 1.95, 2.10, 2.60),
    "porridge oats": createPriceList(1.40, 1.50, 1.60, 2.00),
    "muesli": createPriceList(2.80, 3.00, 3.20, 4.00),
    "granola": createPriceList(3.20, 3.50, 3.80, 4.80),
    
    // Canned & Packaged
    "baked beans": createPriceList(0.50, 0.55, 0.60, 0.75),
    "tinned tomatoes": createPriceList(0.65, 0.70, 0.75, 0.95),
    "tuna canned": createPriceList(1.20, 1.30, 1.40, 1.80),
    "soup": createPriceList(1.50, 1.65, 1.80, 2.30),
    "chicken soup": createPriceList(1.60, 1.75, 1.90, 2.40),
    "tomato soup": createPriceList(1.40, 1.50, 1.60, 2.00),
    
    // Frozen Foods
    "ice cream": createPriceList(3.00, 3.30, 3.50, 4.50),
    "frozen peas": createPriceList(1.20, 1.30, 1.40, 1.80),
    "frozen vegetables": createPriceList(1.50, 1.65, 1.80, 2.30),
    "frozen pizza": createPriceList(2.50, 2.70, 2.90, 3.60),
    "chips": createPriceList(1.80, 1.95, 2.10, 2.60),
    "frozen berries": createPriceList(3.50, 3.80, 4.00, 5.20),
    
    // Snacks
    "chocolate": createPriceList(1.50, 1.65, 1.80, 2.30),
    "crisps": createPriceList(1.80, 1.95, 2.10, 2.60),
    "biscuits": createPriceList(1.20, 1.30, 1.40, 1.80),
    "crackers": createPriceList(1.60, 1.75, 1.90, 2.40),
    "nuts": createPriceList(2.80, 3.00, 3.20, 4.00),
    "almonds": createPriceList(3.50, 3.80, 4.00, 5.20),
    "peanuts": createPriceList(1.80, 1.95, 2.10, 2.60),
    "popcorn": createPriceList(1.50, 1.65, 1.80, 2.30),
    
    // Condiments & Sauces
    "ketchup": createPriceList(1.80, 1.95, 2.10, 2.60),
    "mayonnaise": createPriceList(1.60, 1.75, 1.90, 2.40),
    "mustard": createPriceList(1.20, 1.30, 1.40, 1.80),
    "soy sauce": createPriceList(1.40, 1.50, 1.60, 2.00),
    "pasta sauce": createPriceList(1.50, 1.65, 1.80, 2.30),
    "curry sauce": createPriceList(2.00, 2.20, 2.40, 3.00),
    
    // Household Items
    "toilet paper": createPriceList(4.50, 4.80, 5.00, 6.20),
    "kitchen roll": createPriceList(2.50, 2.70, 2.90, 3.60),
    "washing powder": createPriceList(5.00, 5.40, 5.80, 7.20),
    "fabric softener": createPriceList(2.80, 3.00, 3.20, 4.00),
    "dish soap": createPriceList(1.20, 1.30, 1.40, 1.80),
    "sponges": createPriceList(1.50, 1.65, 1.80, 2.30),
};

// Build store-specific price maps
const buildStorePrices = (store: "asda" | "tesco" | "sainsbury" | "waitrose") => {
    const prices: Record<string, number> = {};
    for (const [item, priceData] of Object.entries(PRICE_DATA)) {
        prices[item] = priceData[store];
    }
    return prices;
};

const STORE_PRICES: Record<string, Record<string, number>> = {
    sainsbury: buildStorePrices("sainsbury"),
    tesco: buildStorePrices("tesco"),
    asda: buildStorePrices("asda"),
    waitrose: buildStorePrices("waitrose")
};

// Delivery times in hours for each store
const DELIVERY_TIMES: Record<string, number> = {
    "sainsbury": 3,
    "tesco": 2,
    "asda": 4,
    "waitrose": 2
};

/**
 * Tool to get prices for items from a specific UK grocery store
 */
export default class GetStorePricesTool implements LuaTool {
    name = "get_store_prices";
    description = "Get prices for grocery items from a specific UK store (Sainsbury's, Tesco, ASDA, or Waitrose). Returns item prices, total cost, and delivery time.";
    
    inputSchema = z.object({
        store: z.enum(["sainsbury", "tesco", "asda", "waitrose"]).describe("The store name (lowercase)"),
        items: z.array(z.string()).describe("List of grocery items to get prices for")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        const { store, items } = input;
        
        if (!STORE_PRICES[store]) {
            return {
                error: `Store "${store}" not found. Available stores: sainsbury, tesco, asda, waitrose`
            };
        }

        const storePrices = STORE_PRICES[store];
        const itemPrices: Array<{ item: string; price: number; found: boolean }> = [];
        let total = 0;
        const notFoundItems: string[] = [];

        // Get prices for each item (normalize item names to lowercase)
        for (const item of items) {
            const normalizedItem = item.toLowerCase();
            const price = storePrices[normalizedItem];
            
            if (price !== undefined) {
                itemPrices.push({ item, price, found: true });
                total += price;
            } else {
                // Use a default price for unknown items
                const defaultPrice = 2.50;
                itemPrices.push({ item, price: defaultPrice, found: false });
                total += defaultPrice;
                notFoundItems.push(item);
            }
        }

        const deliveryTime = DELIVERY_TIMES[store] || 3;

        return {
            store: store.charAt(0).toUpperCase() + store.slice(1),
            items: itemPrices,
            total: Math.round(total * 100) / 100,
            deliveryTimeHours: deliveryTime,
            deliveryTimeFormatted: `${deliveryTime} hour${deliveryTime > 1 ? 's' : ''}`,
            notFoundItems: notFoundItems.length > 0 ? notFoundItems : undefined,
            message: `Prices from ${store.charAt(0).toUpperCase() + store.slice(1)}: Total £${total.toFixed(2)}, Delivery: ${deliveryTime} hour${deliveryTime > 1 ? 's' : ''}`
        };
    }
}
