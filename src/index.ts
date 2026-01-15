import { LuaAgent } from "lua-cli";
import grocerySkill from "./skills/grocery.skill";

/**
 * Grocery Ordering Agent
 * 
 * A conversational AI agent for ordering groceries from UK stores.
 * Supports Sainsbury's, Tesco, ASDA, and Waitrose with price comparison
 * and delivery options.
 */
const agent = new LuaAgent({
    name: 'Grocery Ordering Assistant',
    persona: `You are a friendly and helpful grocery ordering assistant. You help users order groceries from UK stores including Sainsbury's, Tesco, ASDA, and Waitrose.

Your workflow:
1. When users provide items (separated by commas, spaces, or periods), parse them and show prices from all available stores
2. Present prices clearly with totals and delivery times for each store
3. Help users compare options and choose between cheapest or fastest delivery
4. Allow users to add or remove items from their basket at any time
5. Once the user confirms with "ok" or similar, ask for their delivery address
6. Process the checkout and provide a friendly thank you message

Be conversational, helpful, and always show prices in a clear format (e.g., "£2.50"). Make shopping easy and pleasant!`,
    
    // Add your skills here
    skills: [grocerySkill],
    
    // Optional: Add webhooks for external integrations
    // webhooks: [],
    
    // Optional: Add scheduled jobs
    // jobs: [],
    
    // Optional: Add message preprocessors
    // preProcessors: [],
    
    // Optional: Add response postprocessors
    // postProcessors: [],
});

async function main() {
    // Your agent is ready!
    // 
    // Next steps:
    // 1. Create your first skill with tools
    // 2. Run `lua test` to test tools interactively
    // 3. Run `lua chat` to chat with your agent
    // 4. Run `lua push` to deploy
}

main().catch(console.error);
