#!/bin/bash

# Generates a JUnit 4 file with a test for each js file in the WD.
# The generated file needs a bit of human post-processing to make it compile :-).
# Time-stamp: <2008-11-29 13:37:56 simonjensen>

V8_DIR=test/v8tests

cat <<EOF 
// Autogenerated `date` by $0
import javascriptanalyzer.Main;
import junit.framework.Assert;

import org.junit.Before;
import org.junit.Test;

public class Testv8Tests {

	public static void main(String[] args) {
		org.junit.runner.JUnitCore.main("Testv8Tests");
	}
	
	@Before
	public void init() {
		System.setProperty("QUIET", "true");
		System.setProperty("TEST", "true");
		System.setProperty("PRINT_TEST_STATS", "true");
	}

EOF

for fn in *.js
do
    echo
    printf "\t//From file $fn\n"
    printf "\t@Test\n"
    printf '\tpublic void %s() throws Exception\n' `echo $fn | sed -E -e s/-/_/g -e s/\.js//g`
    printf "\t{\n"
    printf "\t\tMisc.start();\n"
    printf "\t\tMisc.captureSystemOutput();\n"
    printf '\t\tString[] args = {"%s/%s"};\n' $V8_DIR $fn
    printf "\t\tMain.main(args);\n"
    printf "\t\tMisc.checkSystemOutput();\n\t}\n" 
done
echo "}"
