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

package dk.brics.tajs.analysis.nativeobjects;

import dk.brics.tajs.analysis.AsyncEvents;
import dk.brics.tajs.analysis.Conversion;
import dk.brics.tajs.analysis.Exceptions;
import dk.brics.tajs.analysis.FunctionCalls;
import dk.brics.tajs.analysis.FunctionCalls.CallInfo;
import dk.brics.tajs.analysis.InitialStateBuilder;
import dk.brics.tajs.analysis.PartialHostModels;
import dk.brics.tajs.analysis.PropVarOperations;
import dk.brics.tajs.analysis.Solver;
import dk.brics.tajs.analysis.dom.ajax.ReadystateEvent;
import dk.brics.tajs.analysis.dom.event.EventListener;
import dk.brics.tajs.analysis.dom.event.KeyboardEvent;
import dk.brics.tajs.analysis.dom.event.MouseEvent;
import dk.brics.tajs.analysis.dom.event.UIEvent;
import dk.brics.tajs.analysis.dom.event.WheelEvent;
import dk.brics.tajs.analysis.nativeobjects.concrete.TAJSConcreteSemantics;
import dk.brics.tajs.analysis.uneval.NormalForm;
import dk.brics.tajs.analysis.uneval.UnevalTools;
import dk.brics.tajs.flowgraph.AbstractNode;
import dk.brics.tajs.flowgraph.Function;
import dk.brics.tajs.flowgraph.SourceLocation;
import dk.brics.tajs.flowgraph.TAJSFunctionName;
import dk.brics.tajs.flowgraph.jsnodes.CallNode;
import dk.brics.tajs.lattice.ContextArguments;
import dk.brics.tajs.lattice.HeapContext;
import dk.brics.tajs.lattice.ObjectLabel;
import dk.brics.tajs.lattice.ObjectLabel.Kind;
import dk.brics.tajs.lattice.PKey.StringPKey;
import dk.brics.tajs.lattice.QueueObject;
import dk.brics.tajs.lattice.State;
import dk.brics.tajs.lattice.UnknownValueResolver;
import dk.brics.tajs.lattice.Value;
import dk.brics.tajs.options.Options;
import dk.brics.tajs.solver.Message.Severity;
import dk.brics.tajs.util.AnalysisException;
import dk.brics.tajs.util.AnalysisLimitationException;
import dk.brics.tajs.util.AnalysisResultException;
import dk.brics.tajs.util.Collectors;
import dk.brics.tajs.util.PathAndURLUtils;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_ADDASYNCIOCALLBACK;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_ADD_CONTEXT_SENSITIVITY;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_ASSERT;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_ASSERT_EQUALS;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_ASYNC_LISTEN;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_CONVERSION_TO_PRIMITIVE;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_DUMPATTRIBUTES;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_DUMPEXPRESSION;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_DUMPMODIFIEDSTATE;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_DUMPNF;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_DUMPOBJECT;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_DUMPPROTOTYPE;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_DUMPQUEUE;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_DUMPSTATE;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_DUMPVALUE;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_FIRST_ORDER_STRING_REPLACE;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_FULFILLEDWITH;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_GET_AJAX_EVENT;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_GET_EVENT_LISTENER;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_GET_KEYBOARD_EVENT;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_GET_MAIN;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_GET_MOUSE_EVENT;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_GET_UI_EVENT;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_GET_WHEEL_EVENT;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_HASTIMERCALLBACK;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_JOIN;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_LOAD;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_LOAD_JSON;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_MAKE;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_MAKEGENERICERROR;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_MAKE_CONTEXT_SENSITIVE;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_MAKE_PARTIAL;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_NEW_ARRAY;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_NEW_OBJECT;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_NODE_PARENT_DIR;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_NODE_REQUIRE_RESOLVE;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_NODE_UNURL;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_NOTINQUEUE;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_NOT_IMPLEMENTED;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_PENDING;
import static dk.brics.tajs.flowgraph.TAJSFunctionName.TAJS_REJECTEDWITH;
import static dk.brics.tajs.util.Collections.newList;
import static dk.brics.tajs.util.Collections.newMap;
import static dk.brics.tajs.util.Collections.newSet;

/**
 * Evaluates the TAJS_* functions (see {@link TAJSFunction}).
 */
public class TAJSFunctionEvaluator {

    private static final Map<TAJSFunctionName, TAJSFunctionImplementation> implementations = makeImplementations();

    private static final Map<String, ObjectLabel> TIMER_QUEUE_OBJS;

    static {
        TIMER_QUEUE_OBJS = new HashMap<>();
        TIMER_QUEUE_OBJS.put("setTimeout", InitialStateBuilder.SET_TIMEOUT_QUEUE_OBJ);
    }

    public static void main(String[] args) {
        Map<TAJSFunctionName, String> documentationStrings = getMarkdownDocumentationStrings();
        System.out.println("# Documentation for TAJS_* functions");
        System.out.println();
        documentationStrings.entrySet().stream()
                .sorted(Comparator.comparing(e -> e.getKey().toString()))
                .map(Map.Entry::getValue)
                .forEach(System.out::println);
        System.out.println();
        System.out.println("(This file is auto-generated by dk.brics.tajs.analysis.nativeobjects.TAJSFunctionEvaluator)");
    }

    public static Value evaluate(TAJSFunction nativeobject, CallInfo call, Solver.SolverInterface c) {
        State state = c.getState();
        PropVarOperations pv = c.getAnalysis().getPropVarOperations();
        return implementations.get(nativeobject.getName()).transfer(call, state, pv, c);
    }

    private static void register(Map<TAJSFunctionName, TAJSFunctionImplementation> implementations, TAJSFunctionName tajsFunctionName, String parameterNames, String returnType, String functionDescription, Transfer transfer) {
        implementations.put(tajsFunctionName, new TAJSFunctionImplementation(tajsFunctionName.toString(), parameterNames, returnType, functionDescription, transfer));
    }

    private static void register(Map<TAJSFunctionName, TAJSFunctionImplementation> implementations, TAJSFunctionName tajsFunctionName, String parameterNames, String functionDescription, VoidTransfer transfer) {
        implementations.put(tajsFunctionName, new TAJSFunctionImplementation(tajsFunctionName.toString(), parameterNames, "void", functionDescription, (call, state, pv, c) -> {
            transfer.transfer(call, state, pv, c);
            return Value.makeUndef();
        }));
    }

    private static Map<TAJSFunctionName, TAJSFunctionImplementation> makeImplementations() {
        Map<TAJSFunctionName, TAJSFunctionImplementation> implementations = newMap();
        register(implementations,
                TAJS_DUMPVALUE,
                "Value value",
                "Prints the given abstract value",
                (call, state, pv, c) -> {
                    Value x = FunctionCalls.readParameter(call, state, 0); // to avoid recover: call.getArg(0);
                    c.getMonitoring().addMessageInfo(c.getNode(), Severity.HIGH, "Abstract value: " + x.restrictToNotModified() /*+ " (context: " + c.getState().getContext() + ")"*/);
                }
        );
        register(implementations,
                TAJS_DUMPPROTOTYPE,
                "Value value",
                "Prints the prototypes of the given abstract value",
                (call, state, pv, c) -> {
                    Value x = FunctionCalls.readParameter(call, state, 0);
                    StringBuilder sb = new StringBuilder();
                    Value p = state.readInternalPrototype(x.getObjectLabels());
                    p = UnknownValueResolver.getRealValue(p, state);
                    while (p.isMaybeObject()) {
                        sb.append(p);
                        p = state.readInternalPrototype(p.getObjectLabels());
                        p = UnknownValueResolver.getRealValue(p, state);
                        if (!p.isNullOrUndef()) {
                            sb.append(" -> ");
                        }
                    }
                    c.getMonitoring().addMessageInfo(c.getNode(), Severity.HIGH, "Prototype: " + sb);
                });
        register(implementations,
                TAJS_DUMPOBJECT,
                "Value value",
                "Prints the objects in the given abstract value",
                (call, state, pv, c) -> {
                    Value x = FunctionCalls.readParameter(call, state, 0);
                    c.getMonitoring().addMessageInfo(c.getNode(), Severity.HIGH, "Abstract object: " + state.printObject(x) /*+ " (context: " + c.getState().getContext() + ")"*/);
                });
        register(implementations,
                TAJS_DUMPQUEUE,
                "",
                "Prints the objects placed in the queue",
                (call, state, pv, c) -> {
                    for (Map.Entry<ObjectLabel, Set<QueueObject>> qs: c.getState().getQueue().entrySet())
                        for (QueueObject qObj: qs.getValue())
                            c.getMonitoring().addMessageInfo(
                                    c.getNode(),
                                    Severity.HIGH,
                                    "Queue object: " + qs.getKey().toString() + " ==>\n" + qObj.toString());
                });
        register(implementations,
                TAJS_ADDASYNCIOCALLBACK,
                "TODO",
                "TODO",
                (call, state, pv, c) -> AsyncIO.addCallback(state, call, c));
        register(implementations,
                TAJS_MAKEGENERICERROR,
                "",
                "Value",
                "Creates an Error object",
                (call, state, pv, c) -> Exceptions.makeTypeError(c));
        register(implementations,
                TAJS_DUMPSTATE,
                "",
                "Prints the current abstract state",
                (call, state, pv, c) -> {
                    c.getMonitoring().addMessageInfo(c.getNode(), Severity.HIGH, "Abstract state:\n" +  /*"Context: " + c.getState().getContext() + "\n" + */ state);
            /*
            try {
                File outdir = new File("out");
                if (!outdir.exists()) {
                    outdir.mkdir();
                }
                FileWriter fw = new FileWriter("out" + File.separator + "state.dot");
                fw.write(state.toDot());
                fw.close();
            } catch (IOException e) {
                throw new AnalysisException(e);
            }
            */
                });
        register(implementations,
                TAJS_DUMPMODIFIEDSTATE,
                "",
                "Prints the modified parts of the current abstract state",
                (call, state, pv, c) -> c.getMonitoring().addMessageInfo(c.getNode(), Severity.HIGH, "Abstract state (modified parts):" /*+ " (context: " + c.getState().getContext() + ")"*/ + state.toStringModified()));
        register(implementations,
                TAJS_DUMPATTRIBUTES,
                "Value object, String propertyName",
                "Prints the attributes of the specified property",
                (call, state, pv, c) -> {
                    Value x = FunctionCalls.readParameter(call, state, 0);
                    Value p = Conversion.toString(FunctionCalls.readParameter(call, state, 1), c);
                    if (!p.isMaybeSingleStr())
                        c.getMonitoring().addMessageInfo(c.getNode(), Severity.HIGH, "Calling dumpAttributes with non-constant property name");
                    else {
                        String propertyname = p.getStr();
                        Value v = c.getAnalysis().getPropVarOperations().readPropertyDirect(x.getObjectLabels(), StringPKey.make(propertyname));
                        c.getMonitoring().addMessageInfo(c.getNode(), Severity.HIGH, "Property attributes: " + v.printAttributes() /*+ " (context: " + c.getState().getContext() + ")"*/);
                    }
                });
        register(implementations,
                TAJS_DUMPEXPRESSION,
                "",
                "Prints the expression computed by Unevalizer at the current program location",
                (call, state, pv, c) -> {
                    CallNode cn = (CallNode) call.getSourceNode();
                    String s = UnevalTools.rebuildFullExpression(c.getFlowGraph(), call.getSourceNode(), cn.getArgRegister(0));
                    c.getMonitoring().addMessageInfo(c.getNode(), Severity.HIGH, "Exp: " + s);
                });
        register(implementations,
                TAJS_DUMPNF,
                "",
                "Prints the normal-form computed by Unevalizer at the current program location",
                (call, state, pv, c) -> {
                    CallNode cn = (CallNode) call.getSourceNode();
                    NormalForm s = UnevalTools.rebuildNormalForm(c.getFlowGraph(), cn, state, c);
                    c.getMonitoring().addMessageInfo(c.getNode(), Severity.HIGH, "NF: " + s);
                });
        register(implementations,
                TAJS_CONVERSION_TO_PRIMITIVE,
                "Value value, [String hint]",
                "PrimitiveValue",
                "Converts the given value to a primitive value, optionally according to a hint (NUM, STR)",
                (call, state, pv, c) -> {
                    Value varg = FunctionCalls.readParameter(call, state, 0);
                    Value vhint;
                    if (call.isUnknownNumberOfArgs())
                        vhint = FunctionCalls.readParameter(call, state, 1).joinStr("NONE");
                    else
                        vhint = call.getNumberOfArgs() >= 2 ? FunctionCalls.readParameter(call, state, 1) : Value.makeStr("NONE");

                    if (!vhint.isMaybeSingleStr()) {
                        c.getMonitoring().addMessageInfo(c.getNode(), Severity.HIGH, "Calling conversionToPrimitive with non-constant hint string");
                        return Value.makeUndef();
                    } else {
                        String shint = vhint.getStr();
                        return Conversion.toPrimitive(varg, shint.equals("NONE") ? Conversion.Hint.NONE : shint.equals("NUM") ? Conversion.Hint.NUM : Conversion.Hint.STR, c);
                    }
                });
        register(implementations,
                TAJS_ADD_CONTEXT_SENSITIVITY,
                "Function|String targetFunctionOrTargetParameterName, [String targetParameterName]",
                "Makes the given or enclosing function context sensitive in the given parameter name",
                (call, state, pv, c) -> {
                    if (call.isUnknownNumberOfArgs())
                        throw new AnalysisException("Calling TAJS_addContextSensitivity with unknown number of arguments");
                    Value param;
                    Function function;
                    if (call.getNumberOfArgs() == 1) { // enclosing function
                        param = FunctionCalls.readParameter(call, state, 0);
                        function = call.getSourceNode().getBlock().getFunction();
                    } else if (call.getNumberOfArgs() == 2) { // function given as first parameter
                        Value funval = FunctionCalls.readParameter(call, state, 0);
                        Set<ObjectLabel> objlabels = funval.getObjectLabels();
                        if (funval.isMaybePrimitiveOrSymbol())
                            throw new AnalysisException("Calling TAJS_addContextSensitivity with non-fixed argument: " + funval);
                        function = null;
                        for (ObjectLabel objlabel : objlabels) {
                            if (objlabel.getKind() != Kind.FUNCTION || objlabel.isHostObject())
                                throw new AnalysisException("Calling TAJS_addContextSensitivity with non-user-function argument: " + objlabel);
                            if (function == null)
                                function = objlabel.getFunction();
                            else if (function != objlabel.getFunction()) // in case of multiple function object labels, they must agree on the function
                                throw new AnalysisException("Calling TAJS_addContextSensitivity with non-fixed argument: " + funval);
                        }
                        if (function == null)
                            throw new AnalysisException("Calling TAJS_addContextSensitivity with non-user-function argument: " + funval);
                        param = FunctionCalls.readParameter(call, state, 1);
                    } else
                        throw new AnalysisException("Calling TAJS_addContextSensitivity with unexpected number of arguments");
                    String var;
                    if (param.isMaybeSingleStr()) {
                        if (param.isMaybeOtherThanStr())
                            throw new AnalysisException("Calling TAJS_addContextSensitivity with non-fixed-string argument: " + param);
                        var = param.getStr();
                    } else if (param.isMaybeSingleNum()) {
                        if (param.isMaybeOtherThanNumUInt())
                            throw new AnalysisException("Calling TAJS_addContextSensitivity with non-fixed-index argument: " + param);
                        var = function.getParameterNames().get(param.getNum().intValue());
                    } else {
                        throw new AnalysisException("Calling TAJS_addContextSensitivity with unexpected argument: " + param);
                    }
                    if (!function.getParameterNames().contains(var)) {
                        throw new AnalysisException("Bad use of manual TAJS_addContextSensitivity. No such parameter name: " + var);
                    }
                    c.getAnalysis().getContextSensitivityStrategy().requestContextSensitiveParameter(function, var);
                });
        register(implementations,
                TAJS_MAKE_CONTEXT_SENSITIVE,
                "Value targetFunction, Integer targetContextSensitivity, [Object contextSensitivityGuard]",
                "Makes the given function *more* context sensitive. If targetContextSensitivity is an unsigned integer then the function is parameter-sensitive in that argument position; " +
                        "if it is -1 then the function is object-sensitive; if it is -2 then the function \"inherits\" the parameter-sensitivity of the enclosing function. " +
                        "The optional guard can have a field named 'caller' with a value indicating from which callers the context sensitivity should apply",
                (call, state, pv, c) -> {
                    Value calleeArg = FunctionCalls.readParameter(call, state, 0);
                    int argumentPositionArg = FunctionCalls.readParameter(call, state, 1).getNum().intValue();
                    Value guardArg = FunctionCalls.readParameter(call, state, 2);
                    Value caller = UnknownValueResolver.getRealValue(pv.readPropertyValue(guardArg.getObjectLabels(), "caller"), c.getState());
                    calleeArg.getObjectLabels().forEach(calleeLabel -> {
                        if (!calleeLabel.isHostObject() && calleeLabel.getKind() == Kind.FUNCTION) {
                            if (caller.isMaybeUndef() || caller.isNone()) {
                                c.getAnalysis().getContextSensitivityStrategy().makeSensitive(calleeLabel.getFunction(), argumentPositionArg);
                            } else {
                                caller.getObjectLabels().forEach(callerLabel -> {
                                    if (!callerLabel.isHostObject() && callerLabel.getKind() == Kind.FUNCTION) {
                                        c.getAnalysis().getContextSensitivityStrategy().makeSensitiveFromCaller(calleeLabel.getFunction(), argumentPositionArg, callerLabel.getFunction());
                                    }
                                });
                            }
                        }
                    });
                });
        register(implementations,
                TAJS_NEW_OBJECT,
                "",
                "Object",
                "Allocates a new Object with a heap-sensitivity that corresponds to the current calling context",
                (call, state, pv, c) -> newInstanceForContext(Kind.OBJECT, InitialStateBuilder.OBJECT_PROTOTYPE, state, call));
        register(implementations,
                TAJS_NEW_ARRAY,
                "",
                "Array",
                "Allocates a new Array with a heap-sensitivity that corresponds to the current calling context",
                (call, state, pv, c) -> newInstanceForContext(Kind.ARRAY, InitialStateBuilder.ARRAY_PROTOTYPE, state, call));
        register(implementations,
                TAJS_ASYNC_LISTEN,
                "Function callback",
                "Registers a callback for asynchronous execution",
                (call, state, pv, c) -> AsyncEvents.listen(call.getSourceNode(), FunctionCalls.readParameter(call, state, 0), c));
        register(implementations,
                TAJS_GET_UI_EVENT,
                "",
                "EventObject",
                "Returns an UIEvent object",
                (call, state, pv, c) -> Value.makeObject(UIEvent.INSTANCES));
        register(implementations,
                TAJS_GET_MOUSE_EVENT,
                "",
                "EventObject",
                "Returns a MouseEvent object",
                (call, state, pv, c) -> Value.makeObject(MouseEvent.INSTANCES));
        register(implementations,
                TAJS_GET_AJAX_EVENT,
                "",
                "EventObject",
                "Returns a ReadyStateEvent object",
                (call, state, pv, c) -> Value.makeObject(ReadystateEvent.INSTANCES));
        register(implementations,
                TAJS_GET_KEYBOARD_EVENT,
                "",
                "EventObject",
                "Returns a KeyboardEvent object",
                (call, state, pv, c) -> Value.makeObject(KeyboardEvent.INSTANCES));
        register(implementations,
                TAJS_GET_EVENT_LISTENER,
                "",
                "EventObject",
                "Returns an EventListener object",
                (call, state, pv, c) -> Value.makeObject(EventListener.INSTANCES));
        register(implementations,
                TAJS_GET_WHEEL_EVENT,
                "",
                "EventObject",
                "Returns a WheelEvent object",
                (call, state, pv, c) -> Value.makeObject(WheelEvent.INSTANCES));
        register(implementations,
                TAJS_ASSERT,
                "Value value, [String predicateNameString = 'isMaybeTrueButNotFalse'], [Boolean expectedResult = true], [Boolean mustBeReachable = true]",
                "Asserts that the value satisfies the given predicates. A predicate name is the name of a predicate method in the lattice.Value class. " +
                        "A disjunction of predicates can be made by interleaving '||' between the predicate names. If expectedResult is false, then the predicate test is expected to fail. " +
                        "Finally, the assertion can be allowed to be unreachable (usually not the case)",
                (call, state, pv, c) -> {
                    if (!c.isScanning()) {
                        return;
                    }
                    tajsValueAssert(TAJS_ASSERT, call, state, c);
                });
        register(implementations,
                TAJS_MAKE,
                "String partialMethodName",
                "Value",
                "Creates an abstract value. The value is created by reflectively invoking the `'make' + partialMethodName`-method of the Value class",
                (call, state, pv, c) -> {
                    Value methodNameSuffix = FunctionCalls.readParameter(call, state, 0);
                    AbstractNode callNode = call.getJSSourceNode();
                    if (!methodNameSuffix.isMaybeSingleStr()) {
                        throw new AnalysisException(callNode.getSourceLocation() + ": " + String.format("Call to %s failed. Method name suffix '%s' is not a single string!", TAJS_MAKE, methodNameSuffix));
                    }
                    return reflectiveMake(methodNameSuffix.getStr(), TAJS_MAKE, callNode.getSourceLocation());
                });
        register(implementations,
                TAJS_MAKE_PARTIAL,
                "String kind, String canonicalName",
                "Object",
                "Creates a \"partial\" object of the given kind (FUNCTION, OBJECT, ARRAY) and canonical name. Partial functions cannot be invoked, and accessing properties of partial objects results in warnings",
                (call, state, pv, c) -> {
                    String kind = FunctionCalls.readParameter(call, state, 0).getStr();
                    Kind allocationKind;
                    ObjectLabel prototype;
                    switch (kind) {
                        case "FUNCTION":
                            allocationKind = Kind.FUNCTION;
                            prototype = InitialStateBuilder.FUNCTION_PROTOTYPE;
                            break;
                        case "OBJECT":
                            allocationKind = Kind.OBJECT;
                            prototype = InitialStateBuilder.OBJECT_PROTOTYPE;
                            break;
                        case "ARRAY":
                            allocationKind = Kind.ARRAY;
                            prototype = InitialStateBuilder.ARRAY_PROTOTYPE;
                            break;
                        default:
                            throw new AnalysisException("Unhandled case: " + kind);
                    }
                    String identifier = FunctionCalls.readParameter(call, state, 1).getStr();
                    ObjectLabel objlabel = ObjectLabel.make(new PartialHostModels(identifier), allocationKind);
                    state.newObject(objlabel);
                    if (allocationKind == Kind.FUNCTION) {
                        ObjectLabel externalPrototype = ObjectLabel.make(new PartialHostModels(String.format("%s.prototype", identifier)), Kind.OBJECT);
                        state.newObject(externalPrototype);
                        state.writeInternalPrototype(externalPrototype, Value.makeObject(InitialStateBuilder.OBJECT_PROTOTYPE));
                        pv.writePropertyWithAttributes(objlabel, "prototype", Value.makeObject(externalPrototype).setAttributes(true, true, false));
                    }
                    state.writeInternalPrototype(objlabel, Value.makeObject(prototype));
                    return Value.makeObject(objlabel);
                });
        register(implementations,
                TAJS_JOIN,
                "Value ... values",
                "Value",
                "Joins the given abstract values into a single abstract value",
                (call, state, pv, c) -> {
                    final Set<Value> values = newSet();
                    for (int i = 0; i < call.getNumberOfArgs(); i++) {
                        values.add(FunctionCalls.readParameter(call, state, i));
                    }
                    return Value.join(values);
                });
        register(implementations,
                TAJS_ASSERT_EQUALS,
                "Value expected, Value actual, [Boolean expectedResult = true]",
                "Asserts that the two values are equal (if expectedResult is true) or that they are not equal (if expectedResult is false)",
                (call, state, pv, c) -> {
                    if (!c.isScanning()) {
                        return;
                    }
                    Value expected = FunctionCalls.readParameter(call, state, 0);
                    Value actual = FunctionCalls.readParameter(call, state, 1);
                    if (call.isUnknownNumberOfArgs() || call.getNumberOfArgs() < 2 || call.getNumberOfArgs() > 3) {
                        throw new AnalysisException(call.getJSSourceNode().getSourceLocation() + ": " + String.format("Unexpected number of arguments to %s", TAJS_ASSERT_EQUALS));
                    }
                    boolean expectedResult;
                    if (call.getNumberOfArgs() == 3) {
                        Value expectedResultValue = FunctionCalls.readParameter(call, state, 2);
                        if (expectedResultValue.isMaybeOtherThanBool() || expectedResultValue.isMaybeAnyBool()) {
                            throw new AnalysisException(call.getJSSourceNode().getSourceLocation() + ": " + String.format("Invalid expectedResult-argument: `%s` to %s", expectedResultValue.toString(), TAJS_ASSERT_EQUALS));
                        }
                        expectedResult = expectedResultValue.isMaybeTrueButNotFalse();
                    } else {
                        expectedResult = true;
                    }
                    if (expected.equals(actual) != expectedResult) {
                        String reason;
                        if (expectedResult) {
                            reason = String.format("Expected=%s, Actual=%s", expected, actual);
                        } else {
                            reason = String.format("Not-expected=%s, Actual=%s", expected, actual);
                        }
                        throw new AnalysisResultException(String.format("Assertion failed. %s (at %s)", reason, call.getJSSourceNode().getSourceLocation()));
                    }
                });
        register(implementations,
                TAJS_LOAD,
                "String file, Boolean isHostEnvironment, String ... parameterNames",
                "Function",
                "Loads a JavaScript file as a function with the chosen parameter names, and optionally marks the function as a host-environment function. " +
                        "If the file is a relative path, it is resolved relative to the file containing the call. " +
                        "Semantically the function behaves as if it was created with `new Function(parameterName1, parameterName2, ... , <content-of-file>)`",
                (call, state, pv, c) -> {
                    Value target = FunctionCalls.readParameter(call, state, 0);
                    Value isHostEnvironment = FunctionCalls.readParameter(call, state, 1);
                    if (target.isMaybeFuzzyStr() || target.isNotStr()) {
                        throw new AnalysisException("Only constant-string TAJS_loads supported: " + target);
                    }
                    if (isHostEnvironment.isMaybeAnyBool() || isHostEnvironment.isMaybeOtherThanBool()) {
                        throw new AnalysisException("Only definite isHostEnvironment TAJS_loads supported: " + isHostEnvironment);
                    }
                    if (call.isUnknownNumberOfArgs()) {
                        throw new AnalysisException("Only known number of arguments supported");
                    }
                    List<String> parameterNames = newList();
                    for (int i = 2; i < call.getNumberOfArgs(); i++) {
                        Value argument = FunctionCalls.readParameter(call, state, i);
                        if (!argument.isMaybeSingleStr()) {
                            throw new AnalysisException("Only constant-string parameter-names for TAJS_load supported: " + argument);
                        }
                        parameterNames.add(argument.getStr());
                    }

                return FunctionFileLoader.loadFunction(target.getStr(), isHostEnvironment.isMaybeTrueButNotFalse(), parameterNames, c);
                });
        register(implementations,
                TAJS_FIRST_ORDER_STRING_REPLACE,
                "Value receiver, Value toReplace, Value toReplaceWith",
                "Value",
                "Implementation of the ECMAScript function String.prototype.replace, without support for a function callback",
                (call, state, pv, c) -> {
                    Value receiver = FunctionCalls.readParameter(call, state, 0);
                    Value toReplace = FunctionCalls.readParameter(call, state, 1);
                    Value toReplaceWith = FunctionCalls.readParameter(call, state, 2);
                    if (toReplaceWith.getObjectLabels().stream().anyMatch(l -> l.getKind() == Kind.FUNCTION)) {
                        throw new AnalysisLimitationException.AnalysisModelLimitationException(c.getNode().getSourceLocation() + ": Replacer function callbacks are not supported: " + toReplaceWith);
                    }
                    return TAJSConcreteSemantics.convertTAJSCallExplicit(receiver, "String.prototype.replace", Arrays.asList(toReplace, toReplaceWith), c, () -> {
                        JSRegExp.makeFuzzyLastIndexOfAnyGlobalRegexes(FunctionCalls.readParameter(call, c.getState(), 0), c);
                        return Value.makeAnyStr();
                    });
                });
        register(implementations,
                TAJS_GET_MAIN,
                "",
                "Value",
                "Returns the absolute path to the main file",
                (call, state, pv, c) ->
                    Value.makeStr(Options.get().getArguments().get(Options.get().getArguments().size() - 1).toAbsolutePath().toString())
                );
        register(implementations,
                TAJS_NOT_IMPLEMENTED,
                "",
                "Placeholder for not-implemented function. Throws AnalysisModelLimitationException if called",
                (call, state, pv, c) -> {
                    throw new AnalysisLimitationException.AnalysisModelLimitationException(call.getSourceNode().getSourceLocation() + ": " + FunctionCalls.readParameter(call, state, 0).getStr());
                });
        register(implementations,
                TAJS_LOAD_JSON,
                "String filename",
                "Value",
                "Loads the JSON file with the given filename (currently just modeled as any-JSON-data)",
                (call, state, pv, c) -> JSJson.makeAnyJSONObject(c)); //TODO: improve precision by actually loading the json file
        register(implementations,
                TAJS_NODE_REQUIRE_RESOLVE,
                "String filename, [String parent = null]",
                "Value",
                "Performs NodeJS require.resolve of the module given as filename",
                (call, state, pv, c) -> {
                    Value filename = FunctionCalls.readParameter(call, state, 0);
                    if (filename.isMaybeFuzzyStr() || filename.isNotStr()) {
                        throw new AnalysisLimitationException.AnalysisPrecisionLimitationException(call.getSourceNode().getSourceLocation() + ": Only constant-string requires supported: " + filename);
                    }
                    Value parentFilename = FunctionCalls.readParameter(call, state, 1);
                    if (parentFilename.isMaybeNull() && !parentFilename.isMaybeOtherThanNull()){
                        parentFilename = Value.makeStr(call.getJSSourceNode().getSourceLocation().getLocation().toString());
                    }
                    if (parentFilename.isMaybeFuzzyStr() || parentFilename.isNotStr()) {
                        throw new AnalysisLimitationException.AnalysisPrecisionLimitationException(call.getSourceNode().getSourceLocation() +  ": Only constant-string requires supported: " + parentFilename);
                    }
                    String filenameString = filename.getStr();
                    URL resolved;
                    if (Paths.get(filenameString).isAbsolute()) {
                        resolved = PathAndURLUtils.toURL(Paths.get(filenameString)); // trivially resolved
                    } else {
                        URL parent = PathAndURLUtils.toURL(parentFilename.getStr());
                        resolved = NodeJSRequire.get().resolve(filenameString, parent);
                        if (resolved == null) {
                            // We could report an JavaScript error here instead.
                            // But that is an unlikely JavaScript error, it is much more likely that there is a bug in TAJS...
                            throw new AnalysisException(
                                    String.format("Failed to resolve TAJS_nodeRequireResolve('%s', '%s')!?!", filenameString, parent)
                            );
                        }
                    }
                    return Value.makeStr(resolved.toString());
                });
        register(implementations,
                TAJS_NODE_PARENT_DIR,
                "filename",
                "Value",
                "Returns the location of the parent directory",
                (call, state, pv, c) -> {
                    Value fileName = FunctionCalls.readParameter(call, state, 0);
                    try {
                        Path parent = Paths.get(new URL(fileName.getStr()).toURI()).getParent();
                        return Value.makeStr(parent.toUri().toString());
                    } catch (URISyntaxException | MalformedURLException e) {
                        throw new RuntimeException(e);
                    }
                });
        register(implementations,
                TAJS_NOTINQUEUE,
                "Value value",
                "Asserts that the object is not in the queue",
                (call, state, pv, c) -> {
                    Value x = FunctionCalls.readParameter(call, state, 0);
                    Set<ObjectLabel> objectLabels = c.getState().getQueue().keySet();
                    for (ObjectLabel objectLabel: x.getObjectLabels())
                        if (objectLabels.contains(objectLabel))
                            throw new AnalysisException(
                                    "Object " + objectLabel.toString()
                                    + " found in the queue");
                });
        register(implementations,
                TAJS_PENDING,
                "Queue object",
                "Asserts that the object is in the queue in pending state",
                (call, state, pv, c) -> {
                    Value x = FunctionCalls.readParameter(call, state, 0);
                    checkStateAndDefaultValue(x.getObjectLabelUnique(),
                                              c.getState(),
                                              QueueObject.QueueState.PENDING,
                                             null);
                });
        register(implementations,
                TAJS_FULFILLEDWITH,
                "Queue object, Value fulfilled value",
                "Asserts that the object is in the queue " +
                        "and it is fulfilled with the given value",
                (call, state, pv, c) -> {
                    Value x = FunctionCalls.readParameter(call, state, 0);
                    Value y = FunctionCalls.readParameter(call, state, 1);
                    y = y.restrictToUndef().isMaybeUndef() ? null : y;
                    checkStateAndDefaultValue(x.getObjectLabelUnique(),
                                              c.getState(),
                                              QueueObject.QueueState.FULFILLED,
                                              y);
                });
        register(implementations,
                TAJS_HASTIMERCALLBACK,
                "String timer, Value callback",
                "Asserts that the given timer has registered"
                        + "the specified callback",
                (call, state, pv, c) -> {
                    String timer = FunctionCalls.readParameter(call, state, 0)
                            .getStr();
                    Value callback = FunctionCalls.readParameter(call, state, 1)
                            .restrictToFunctions();
                    checkTimerCallback(timer, state, callback);
                });
        register(implementations,
                TAJS_REJECTEDWITH,
                "Queue object, Value rejected value",
                "Asserts that the object is in the queue " +
                        "and it is rejected with the given value",
                (call, state, pv, c) -> {
                    Value x = FunctionCalls.readParameter(call, state, 0);
                    Value y = FunctionCalls.readParameter(call, state, 1);
                    y = y.restrictToUndef().isMaybeUndef() ? null : y;
                    checkStateAndDefaultValue(x.getObjectLabelUnique(),
                                              c.getState(),
                                              QueueObject.QueueState.REJECTED,
                                              y);
                });
        register(implementations,
                TAJS_NODE_UNURL,
                "url",
                "Value",
                "Changes a file URL to an absolute path (Str-Value), changes non-file URLs to null (Null-Value)",
                (call, state, pv, c) -> {
                    Value urlValue = FunctionCalls.readParameter(call, state, 0);
                    URL url = PathAndURLUtils.toURL(urlValue.getStr());
                    if (url.getProtocol().equals("file")) {
                        String path = url.getPath();
                        if (path.endsWith("/")) {
                            path = path.substring(0, path.length() - 1 /* skip trailing slash */);
                        }
                        return Value.makeStr(path);
                    }
                    return Value.makeNull();
                });
        Set<TAJSFunctionName> missingRegistrations = newSet(Arrays.asList(TAJSFunctionName.values()));
        missingRegistrations.removeAll(implementations.keySet());
        if (!missingRegistrations.isEmpty()) {
            throw new AnalysisException("No transfer function registered for: " + missingRegistrations);
        }
        return implementations;
    }

    private static Value reflectiveMake(String methodNameSuffix, TAJSFunctionName tajsFunctionName, SourceLocation sourceLocation) { // TODO: inline?
        String methodName = "make" + methodNameSuffix;
        try {
            Method method = Value.class.getMethod(methodName);
            return (Value) method.invoke(null);
        } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
            throw new AnalysisException(sourceLocation + ": " + String.format("Call to %s failed (%s). Method '%s' is not a zero-argument static method on the Value class!", tajsFunctionName.toString(), e.getClass().getSimpleName(), methodName));
        }
    }

    private static void checkTimerCallback(String timer, State state,
                                           Value callback) {
        ObjectLabel queueObj = TIMER_QUEUE_OBJS.get(timer);
        if (queueObj == null)
            throw new AnalysisException(
                    "Given timer " + timer + " is not supported");
        Set<QueueObject> queueObjects = state.getQueue().get(queueObj);
        if (queueObjects.size() != 1)
            throw new AnalysisException("Object " + queueObj.toString()
                    + " is associated with multiple queue objects");
        QueueObject queueObject = queueObjects.iterator().next();
        boolean hasCallback = queueObject.getResolvedCallbacks()
                .getAllCallbacks()
                .stream()
                .anyMatch(x -> x.getCallback().equals(callback));
        if (!hasCallback)
            throw new AnalysisException(
                    "Timer " + timer + " has not registered callback "
                    + callback.toString());
    }

    private static void checkStateAndDefaultValue(ObjectLabel queueObj,
                                                  State state,
                                                  QueueObject.QueueState queueState,
                                                  Value value) {
        if (queueObj == null)
            throw new AnalysisException();
        Set<QueueObject> queueObjects = state.getQueue().get(queueObj);
        if (queueObjects == null)
            throw new AnalysisException("Object " + queueObj.toString()
                    + " not found in the queue");
        if (queueObjects.size() != 1)
            throw new AnalysisException("Object " + queueObj.toString()
                    + " is associated with multiple queue objects");
        QueueObject queueObject = queueObjects.iterator().next();
        boolean valsAreEqual = Objects.equals(value, queueObject.getDefaultValue());

        if (queueObject.getState() != queueState
                || !valsAreEqual) {
            String val = queueObject.getDefaultValue() == null ?
                    "null" : queueObject.getDefaultValue().toString();
            String expectVal = value == null ? "null" : value.toString();
            throw new AnalysisException("Object " + queueObj.toString()
                    + " is not in state " + queueState
                    + " with value " + expectVal
                    + ". Actual state: " + queueObject.getState()
                    + ", actual value " + val);
        }
    }

    /**
     * Instantiates a new object which inherits (parts of) the current calling context.
     */
    private static Value newInstanceForContext(Kind allocationKind, ObjectLabel prototype, State state, CallInfo call) {
        ContextArguments funArgs = state.getContext().getFunArgs();
        // crude guard against infinite allocations due to recursion:
        // if the current receiver is using this allocation site already, then we do not nest the context further
        // (infinite recursive allocations should be guarded elsewhere)
        Set<ObjectLabel> callContextReceivers = newSet();
        if (funArgs != null && funArgs.getSelectedClosureVariables() != null) {
            callContextReceivers.addAll(funArgs.getSelectedClosureVariables().getOrDefault("this", Value.makeNone()).getObjectLabels());
        }
        if (state.getContext().getThisVal() != null) {
            callContextReceivers.addAll(state.getContext().getThisVal().getAllObjectLabels());
        }
        Set<SourceLocation> callContextReceiverAllocationSites = callContextReceivers.stream().map(ObjectLabel::getSourceLocation).collect(Collectors.toSet());
        ObjectLabel objlabel;
        SourceLocation allocationSite = call.getSourceNode().getSourceLocation();
        if (callContextReceiverAllocationSites.contains(allocationSite)) {
            Map<String, Value> recursiveTagger = newMap();
            recursiveTagger.put("isRecursiveAllocation", Value.makeBool(true)); // TODO: "isRecursiveAllocation"??? (see comment at the beginning of this method)
            objlabel = ObjectLabel.make(call.getSourceNode(), allocationKind, HeapContext.make(null, recursiveTagger));
        } else {
            objlabel = ObjectLabel.make(call.getSourceNode(), allocationKind, HeapContext.make(funArgs, null));
        }
        state.newObject(objlabel);
        state.writeInternalPrototype(objlabel, Value.makeObject(prototype));
        return Value.makeObject(objlabel);
    }

    /**
     * Generic value assertion. Could replace all other asserts.
     * <p>
     * Signature:
     * <p>
     * <pre>
     * TAJS_assert(value, predicate?, expectedResult?, mustBeReachable?)
     * </pre>
     * Optional arguments default to ~true. Thus TAJS_assert(x) is equivalent to the usual assert(x)
     * <p>
     * The predicate is an expression of predicate method names on {@link Value}, the method names can be combined with the logical connector '||', whitespace is ignored.
     * <p>
     * Examples:
     * <pre>
     * TAJS_assert(value, isMaybeAnyNum, expectedResult)
     * TAJS_assert(value, isMaybeAnyNum || isMaybeAnyString, expectedResult)
     * TAJS_assert(value, isMaybeAnyNum || isMaybeAnyString || isMaybeObject, expectedResult)
     * </pre>
     * <p>
     * where:
     * <ul>
     * <li><b>value</b> is the JavaScript value to assert something about</li>
     * <li><b>predicate</b> is the predicates to evaluate <b>value</b> with</li>
     * <li><b>expectedResult</b> is the single boolean expected return value of the predicate invocation. E.g. true</li>
     * </ul>
     */
    private static void tajsValueAssert(TAJSFunctionName tajsFunctionName, CallInfo call, final State state, Solver.SolverInterface c) {
        Value value = FunctionCalls.readParameter(call, state, 0);
        final Value predicate;
        if (call.getNumberOfArgs() < 2) {
            predicate = Value.makeStr("isMaybeTrueButNotFalse");
        } else {
            predicate = FunctionCalls.readParameter(call, state, 1);
        }
        final Value expectedResult;
        if (call.getNumberOfArgs() < 3) {
            expectedResult = Value.makeBool(true);
        } else {
            expectedResult = FunctionCalls.readParameter(call, state, 2);
        }
        SourceLocation sourceLocation = call.getSourceNode().getSourceLocation();
        reflectiveAssert(tajsFunctionName, value, predicate, expectedResult, sourceLocation);
    }

    private static void reflectiveAssert(TAJSFunctionName tajsFunctionName, Value value, Value predicate, Value expectedResult, SourceLocation sourceLocation) {
        if (!predicate.isMaybeSingleStr()) {
            throw new AnalysisException(String.format("Call to %s failed. Predicate '%s' is not a single string!", tajsFunctionName.toString(), predicate));
        }
        if (!(expectedResult.isMaybeTrueButNotFalse() || expectedResult.isMaybeFalseButNotTrue())) {
            throw new AnalysisException(String.format("Call to %s failed. Expected result '%s' is not a single boolean!", tajsFunctionName.toString(), expectedResult));
        }
        final String predicateString = predicate.getStr().replace(" ", "");
        boolean result = false;
        for (String methodName : predicateString.split("\\|\\|")) {
            try {
                Method method = Value.class.getMethod(methodName.trim());
                result = result || (boolean) method.invoke(value);
            } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
                throw new AnalysisException(String.format("Call to %s failed (%s). Predicate '%s' is not a zero-argument predicate on the Value class!", tajsFunctionName.toString(), e.getClass().getSimpleName(), methodName));
            }
        }
        if ((expectedResult.isMaybeTrueButNotFalse() && !result) || (expectedResult.isMaybeFalseButNotTrue() && result)) {
            throw new AnalysisResultException(String.format("Assertion failed:  <%s>(%s) != %s (%s)", predicate, value, expectedResult, sourceLocation));
        }
    }

    private static Map<TAJSFunctionName, String> getMarkdownDocumentationStrings() {
        return implementations.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> {
                    TAJSFunctionImplementation implementation = e.getValue();
                    return String.format("- **%s**(%s) -> %s:%n    - %s.", implementation.name, implementation.parameters, implementation.returnType, implementation.functionDescription);
                }));
    }

    @FunctionalInterface
    private interface Transfer {

        Value transfer(CallInfo call, State state, PropVarOperations pv, Solver.SolverInterface c);
    }

    @FunctionalInterface
    private interface VoidTransfer {

        void transfer(CallInfo call, State state, PropVarOperations pv, Solver.SolverInterface c);
    }

    private static class TAJSFunctionImplementation {

        private final String name;

        private final String parameters;

        private final String returnType;

        private final String functionDescription;

        private final Transfer transfer;

        public TAJSFunctionImplementation(String name, String parameters, String returnType, String functionDescription, Transfer transfer) {
            if (name.isEmpty()) {
                throw new AnalysisException("Empty name type for " + name);
            }
            this.name = name;
            this.parameters = parameters;
            if (returnType.isEmpty()) {
                throw new AnalysisException("Empty return type for " + name);
            }
            this.returnType = returnType;
            if (functionDescription.isEmpty()) {
                throw new AnalysisException("Empty description for " + name);
            }
            this.functionDescription = functionDescription;
            this.transfer = transfer;
        }

        @Override
        public String toString() {
            return name;
        }

        public Value transfer(CallInfo call, State state, PropVarOperations pv, Solver.SolverInterface c) {
            return transfer.transfer(call, state, pv, c);
        }
    }
}
