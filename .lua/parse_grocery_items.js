async (input) => {
  var o=Object.defineProperty;var a=Object.getOwnPropertyDescriptor;var p=Object.getOwnPropertyNames;var c=Object.prototype.hasOwnProperty;var u=(t,e)=>{for(var i in e)o(t,i,{get:e[i],enumerable:!0})},g=(t,e,i,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of p(e))!c.call(t,s)&&s!==i&&o(t,s,{get:()=>e[s],enumerable:!(r=a(e,s))||r.enumerable});return t};var l=t=>g(o({},"__esModule",{value:!0}),t);var d={};u(d,{default:()=>n});module.exports=l(d);var m=require("zod"),n=class{name="parse_grocery_items";description="Parse a list of grocery items from user input. Items can be separated by commas, spaces, or periods.";inputSchema=m.z.object({userInput:m.z.string().describe("The user's input containing grocery items separated by commas, spaces, or periods")});async execute(e){let{userInput:i}=e,r=i.split(/[,.\s]+/).map(s=>s.trim()).filter(s=>s.length>0);return{items:r,itemCount:r.length,message:`Found ${r.length} item(s): ${r.join(", ")}`}}};

  
  const ToolClass = module.exports.default || module.exports.ParseItemsTool || module.exports;
  const toolInstance = new ToolClass();
  return await toolInstance.execute(input);
}