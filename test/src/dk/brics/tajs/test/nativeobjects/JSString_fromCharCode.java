package dk.brics.tajs.test.nativeobjects;

import dk.brics.tajs.Main;
import dk.brics.tajs.options.Options;
import dk.brics.tajs.test.Misc;
import org.junit.Before;
import org.junit.Test;

@SuppressWarnings("static-method")
public class JSString_fromCharCode {

    @Before
    public void before() {
        Main.reset();
        Options.get().enableTest();
    }

    @Test
    public void noArgs() {
        Misc.runSource("var v = String.fromCharCode();",
                "TAJS_assert(v === '');");
    }

    @Test
    public void undefinedSingeArgs() {
        Misc.runSource("var v = String.fromCharCode(undefined);",
                "TAJS_assert(v === '\u0000');");
    }

    @Test
    public void singleArg() {
        Misc.runSource("var v = String.fromCharCode(102);",
                "TAJS_assert(v === 'f');");
    }

    @Test
    public void multiArg() {
        Misc.runSource("var v = String.fromCharCode(102, 111, 111);",
                "TAJS_assert(v === 'foo');");
    }

    @Test
    public void trashArg() {
        Misc.runSource("var v = String.fromCharCode('foo');",
                "TAJS_assert(v === '\u0000');");
    }

    @Test
    public void unknown_charCode() {
        Misc.runSource("var v = String.fromCharCode(Math.random());",
                "TAJS_assert(v, 'isMaybeAnyStr', true);");
    }
}
