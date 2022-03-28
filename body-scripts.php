<noscript>
  <meta http-equiv="refresh" content="0;url=noscript.html">
</noscript>
<!--Scripts-->

<!--Libraries-->
<!-- Bootstrap and Popper -- Local hosted -->
<script src="/includes/frameworks/bootstrapAndpopper/bootstrap.bundle.min.js"></script>


<!-- Sound manager -->
<script src="./includes/frameworks/soundManager/soundmanager2.js" defer></script>

<!-- Custom -->
<script src="/includes/every.js?v=?<?php echo getNewestVersion(); ?>" type="module" defer></script>
<script type="module" src="includes/offcanvas.inc.js?v=?<?php echo getNewestVersion(); ?>" defer></script>

<script type="module" defer>
  import * as Utils from "./includes/utils.js";

  Utils.holdSererContact("./includes/generalFunctions.php");

</script>
