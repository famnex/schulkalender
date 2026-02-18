<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>JavaScript Shield UI Demos</title>
    <link id="themecss" rel="stylesheet" type="text/css" href="//www.shieldui.com/shared/components/latest/css/light/all.min.css" />
    <script type="text/javascript" src="//www.shieldui.com/shared/components/latest/js/jquery-1.11.1.min.js"></script>
    <script type="text/javascript" src="//www.shieldui.com/shared/components/latest/js/shieldui-all.min.js"></script>
</head>
<body class="theme-light">
<div class="container">
    <div class="left">
        <img src="/Content/img/datepicker/repair.png" />
    </div>
    <div>
        <span><b><u>Service Request Form</u></b></span>
        <br />
        <br />
        <br />
        <input id="datepicker1" />
        <span><i>(Car Production Month and Year)</i></span>
        <br />
        <br />
        <input id="datepicker2" />
        <span><i>(Car First Registration)</i></span>
        <br />
        <br />
        <input id="datepicker3" />
        <span><i>(Last Insurance month)</i></span>
    </div>
    <div id="field"></div>
</div>
<script type="text/javascript">
    jQuery(function ($) {
        $("#datepicker1").shieldMonthYearPicker();
        $("#datepicker2").shieldMonthYearPicker();
        $("#datepicker3").shieldMonthYearPicker();
    });
</script>
<style>
    .container {
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }
    .left {
        float: left;
        margin-right: 20px;
    }
</style>
</body>
</html>