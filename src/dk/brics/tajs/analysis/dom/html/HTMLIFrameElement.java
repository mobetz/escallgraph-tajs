/*
 * Copyright 2009-2018 Aarhus University
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package dk.brics.tajs.analysis.dom.html;

import dk.brics.tajs.analysis.InitialStateBuilder;
import dk.brics.tajs.analysis.PropVarOperations;
import dk.brics.tajs.analysis.Solver;
import dk.brics.tajs.analysis.dom.DOMObjects;
import dk.brics.tajs.analysis.dom.DOMWindow;
import dk.brics.tajs.analysis.dom.core.DOMDocument;
import dk.brics.tajs.lattice.ObjectLabel;
import dk.brics.tajs.lattice.State;
import dk.brics.tajs.lattice.Value;

import static dk.brics.tajs.analysis.dom.DOMFunctions.createDOMProperty;

/**
 * Inline subwindows. See the IFRAME element definition in HTML 4.01.
 */
public class HTMLIFrameElement {

    public static ObjectLabel CONSTRUCTOR;

    public static ObjectLabel PROTOTYPE;

    public static ObjectLabel INSTANCES;

    public static void build(Solver.SolverInterface c) {
        State s = c.getState();
        PropVarOperations pv = c.getAnalysis().getPropVarOperations();
        CONSTRUCTOR = ObjectLabel.make(DOMObjects.HTMLIFRAMEELEMENT_CONSTRUCTOR, ObjectLabel.Kind.FUNCTION);
        PROTOTYPE = ObjectLabel.make(DOMObjects.HTMLIFRAMEELEMENT_PROTOTYPE, ObjectLabel.Kind.OBJECT);
        INSTANCES = ObjectLabel.make(DOMObjects.HTMLIFRAMEELEMENT_INSTANCES, ObjectLabel.Kind.OBJECT);

        // Constructor Object
        s.newObject(CONSTRUCTOR);
        pv.writePropertyWithAttributes(CONSTRUCTOR, "length", Value.makeNum(0).setAttributes(true, true, true));
        pv.writePropertyWithAttributes(CONSTRUCTOR, "prototype", Value.makeObject(PROTOTYPE).setAttributes(true, true, true));
        s.writeInternalPrototype(CONSTRUCTOR, Value.makeObject(InitialStateBuilder.FUNCTION_PROTOTYPE));
        pv.writeProperty(DOMWindow.WINDOW, "HTMLIFrameElement", Value.makeObject(CONSTRUCTOR));

        // Prototype Object
        s.newObject(PROTOTYPE);
        s.writeInternalPrototype(PROTOTYPE, Value.makeObject(HTMLElement.ELEMENT_PROTOTYPE));

        // Multiplied Object
        s.newObject(INSTANCES);
        s.writeInternalPrototype(INSTANCES, Value.makeObject(PROTOTYPE));

        /*
         * Properties.
         */
        // DOM Level 1
        createDOMProperty(INSTANCES, "align", Value.makeAnyStr(), c);
        createDOMProperty(INSTANCES, "frameBorder", Value.makeAnyStr(), c);
        createDOMProperty(INSTANCES, "height", Value.makeAnyStr(), c);
        createDOMProperty(INSTANCES, "longDesc", Value.makeAnyStr(), c);
        createDOMProperty(INSTANCES, "marginHeight", Value.makeAnyStr(), c);
        createDOMProperty(INSTANCES, "marginWidth", Value.makeAnyStr(), c);
        createDOMProperty(INSTANCES, "scrolling", Value.makeAnyStr(), c);
        createDOMProperty(INSTANCES, "src", Value.makeAnyStr(), c);
        createDOMProperty(INSTANCES, "width", Value.makeAnyStr(), c);

        // DOM Level 2
        createDOMProperty(INSTANCES, "contentDocument", Value.makeObject(DOMDocument.INSTANCES).setReadOnly().setReadOnly(), c);
        createDOMProperty(INSTANCES, "contentWindow", Value.makeObject(DOMWindow.WINDOW).setReadOnly().setReadOnly(), c);

        s.multiplyObject(INSTANCES);
        INSTANCES = INSTANCES.makeSingleton().makeSummary();

        /*
         * Functions.
         */
        // No functions.
    }
}
