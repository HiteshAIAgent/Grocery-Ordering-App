import { LuaSkill } from "lua-cli";
import ParseItemsTool from "./tools/ParseItemsTool";
import GetStorePricesTool from "./tools/GetStorePricesTool";
import CompareStoresTool from "./tools/CompareStoresTool";
import ManageBasketTool from "./tools/ManageBasketTool";
import ProcessCheckoutTool from "./tools/ProcessCheckoutTool";

const grocerySkill = new LuaSkill({
    name: "grocery-ordering-skill",
    description: "Tools for grocery ordering from UK stores (Sainsbury's, Tesco, ASDA, Waitrose). Handles item parsing, price comparison, basket management, and checkout.",
    context: `Use these tools when users want to order groceries. The flow should be:
    1. Parse items from user input (items can be separated by commas, spaces, or periods)
    2. Show prices from available stores (Sainsbury's, Tesco, ASDA, Waitrose)
    3. Allow user to compare stores and choose cheapest or fastest delivery
    4. Allow user to add or remove items from basket at any time
    5. When user says "ok" or confirms, ask for delivery address
    6. Process checkout and show thank you message
    
    Be conversational and helpful. Always show item prices clearly. Let users modify their basket before final checkout.`,
    tools: [
        new ParseItemsTool(),
        new GetStorePricesTool(),
        new CompareStoresTool(),
        new ManageBasketTool(),
        new ProcessCheckoutTool()
    ],
});

export default grocerySkill;
