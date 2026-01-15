import { LuaTool } from "lua-cli";
import { z } from "zod";

/**
 * Tool to process checkout - collects address and confirms order
 */
export default class ProcessCheckoutTool implements LuaTool {
    name = "process_checkout";
    description = "Process the checkout by collecting delivery address and confirming the order. Use this when the user confirms they're ready to checkout.";
    
    inputSchema = z.object({
        store: z.string().describe("The selected store name"),
        items: z.array(z.string()).describe("List of items in the basket"),
        total: z.number().describe("Total cost of the order"),
        address: z.string().optional().describe("Delivery address (if provided by user)")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        const { store, items, total, address } = input;
        
        if (!address) {
            return {
                status: "address_required",
                message: "Please provide your delivery address to complete your order.",
                orderDetails: {
                    store,
                    itemCount: items.length,
                    total: total.toFixed(2)
                }
            };
        }

        // Order confirmed with address
        return {
            status: "confirmed",
            orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
            store,
            items,
            itemCount: items.length,
            total: total.toFixed(2),
            address,
            message: `Thank you for your order! Your order #${Date.now().toString().slice(-8)} has been confirmed. Your groceries will be delivered to ${address} from ${store}.`
        };
    }
}
