/* =====================================================================
   Start
   ===================================================================== */
(async () => {
  applyTheme();
  
  await serverLoad();
  applyTheme(); updateChip();
  route();
  if (API) setInterval(poll, 4000);
})();
