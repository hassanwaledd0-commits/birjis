/* ---------- AI: one shared sample capability for every AI box ----------
   Since 2026-11 it is the three-tier function of x_ai~tiers.js (Claude in the page -> the site's server -> offline answers from the site),
   so it is never null. The English reply-language line (IL_AI_EN, x_i18n.js) is added there, for tiers a and b alike. */
let SAMPLE;
async function getSample(){
  if(SAMPLE!==undefined) return SAMPLE;
  await aiRawA(); SAMPLE=aiSample(); try{ aiModeSync(); }catch(e){}
  return SAMPLE;
}
