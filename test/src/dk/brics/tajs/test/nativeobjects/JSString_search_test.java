package dk.brics.tajs.test.nativeobjects;

import dk.brics.tajs.Main;
import dk.brics.tajs.options.Options;
import dk.brics.tajs.test.Misc;
import org.junit.Before;
import org.junit.Test;

@SuppressWarnings("static-method")
public class JSString_search_test {

    @Before
    public void before() {
        Main.reset();
        Options.get().enableTest();
    }

    @Test
    public void noArgs() {
        Misc.runSource("var v = 'foo'.search();",
                "TAJS_assert(v === 0);");
    }

    @Test
    public void init() {
        Misc.runSource("var v = 'foo'.search('f');",
                "TAJS_assert(v === 0);");
    }

    @Test
    public void notFound() {
        Misc.runSource("var v = 'foo'.search('x');",
                "TAJS_assert(v === -1);");
    }

    @Test
    public void init2() {
        Misc.runSource("var v = 'foo'.search('fo');",
                "TAJS_assert(v === 0);");
    }

    @Test
    public void notInit() {
        Misc.runSource("var v = 'foo'.search('oo');",
                "TAJS_assert(v === 1);");
    }

    @Test
    public void regex() {
        Misc.runSource("var v = 'foo'.search('[^f]o');",
                "TAJS_assert(v === 1);");
    }

    @Test
    public void unknown() {
        Misc.runSource("var v = 'foo'.search(Math.random()? 'foo': 'bar');",
                "TAJS_assert(v, 'isMaybeNumUInt || isMaybeNumOther', true);");
    }
}
