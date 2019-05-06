package dk.brics.tajs.test;

import dk.brics.tajs.Main;
import dk.brics.tajs.options.Options;
import dk.brics.tajs.util.AnalysisException;
import dk.brics.tajs.util.AnalysisLimitationException;
import org.junit.Before;
import org.junit.Test;

/**
 * Entries from the js1k.com competition
 * (current status: output uninspected)
 */
public class Test1K2013Spring {

    @Before
    public void init() {
        Main.reset();
        Options.get().enableTest();
        Options.get().enableIncludeDom();
        Options.get().enableUnevalizer();
        Options.get().enablePolyfillMDN();
        Options.get().setAnalysisTimeLimit(1 * 60);
    }

    @Test
    public void test1k_2013_spring_1307() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1307.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1309() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1309.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1310() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1310.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1311() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1311.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1316() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1316.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1319() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1319.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1323() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1323.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1334() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1334.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1336() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1336.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1337() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1337.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1344() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1344.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1345() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1345.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1350() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1350.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1358() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1358.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1360() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1360.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1362() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1362.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1375() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1375.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1376() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1376.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1377() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1377.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1379() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1379.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1384() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1384.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1388() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1388.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1392() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1392.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1398() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1398.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1400() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1400.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1404() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1404.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1411() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1411.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1415() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1415.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1417() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1417.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1420() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1420.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1421() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1421.js");
        Misc.checkSystemOutput();
    }

    @Test(expected = AnalysisLimitationException.AnalysisPrecisionLimitationException.class)
    public void test1k_2013_spring_1423() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1423.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1425() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1425.js");
        Misc.checkSystemOutput();
    }

    @Test(expected = AnalysisLimitationException.AnalysisPrecisionLimitationException.class)
    public void test1k_2013_spring_1426() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1426.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1427() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1427.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1428() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1428.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1429() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1429.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1430() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1430.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1436() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1436.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1437() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1437.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1438() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1438.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1442() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1442.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1443() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1443.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1449() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1449.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1450() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1450.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1454() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1454.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1457() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1457.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1458() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1458.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1462() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1462.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1470() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1470.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1472() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1472.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1473() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1473.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1475() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1475.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1478() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1478.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1479() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1479.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1483() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1483.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1484() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1484.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1486() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1486.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1498() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1498.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1502() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1502.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1506() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1506.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1507() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1507.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1510() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1510.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1511() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1511.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1514() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1514.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1524() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1524.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1525() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1525.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1526() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1526.js");
        Misc.checkSystemOutput();
    }

    @Test(expected = AnalysisException.class)
    public void test1k_2013_spring_1528() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1528.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1529() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1529.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1533() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1533.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1535() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1535.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1536() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1536.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1537() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1537.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1539() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1539.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1541() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1541.js");
        Misc.checkSystemOutput();
    }

    @Test(expected = AnalysisLimitationException.class) // TODO investigate (GitHub #417)
    public void test1k_2013_spring_1542() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1542.js");
        Misc.checkSystemOutput();
    }

    @Test(expected = AnalysisLimitationException.AnalysisPrecisionLimitationException.class)
    public void test1k_2013_spring_1544() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1544.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1547() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1547.js");
        Misc.checkSystemOutput();
    }

    @Test
    public void test1k_2013_spring_1557() {
        Misc.run("test-resources/src/1k2013spring/shim.js", "test-resources/src/1k2013spring/1557.js");
        Misc.checkSystemOutput();
    }
}
