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

package dk.brics.tajs.lattice;

import dk.brics.tajs.util.AnalysisException;
import dk.brics.tajs.util.Canonicalizer;
import dk.brics.tajs.util.Collections;
import dk.brics.tajs.util.DeepImmutable;
import dk.brics.tajs.util.Strings;

import javax.annotation.Nonnull;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * A fixed property key.
 */
abstract public class PKey implements Comparable<PKey>, DeepImmutable { // XXX: rename class (and other occurrences of "PKey")?

    /**
     * Converts this property key to a {@link Value}.
     */
    public abstract Value toValue();

    /**
     * Checks whether this property key is an array index.
     */
    public abstract boolean isArrayIndex();

    /**
     * Checks whether this property matches the given value.
     */
    public abstract boolean isMaybeValue(PKeys v);

    @Override
    public int compareTo(@Nonnull PKey o) {
        if (this instanceof StringPKey) {
            if (o instanceof StringPKey) {
                return ((StringPKey)this).getStr().compareTo(((StringPKey)o).getStr());
            } else {
                return 1;
            }
        } else if (o instanceof StringPKey) {
            return -1;
        } else {
            return ((SymbolPKey)this).getObjectLabel().compareTo(((SymbolPKey)o).getObjectLabel());
        }
    }

    abstract public boolean equals(Object o);

    abstract public int hashCode();

    /**
     * Returns a string representation of this property key, with special characters escaped.
     */
    abstract public String toStringEscaped();

    /**
     * Returns a property key describing the given singleton property key value.
     * @throws AnalysisException if not a singleton
     */
    public static PKey make(PKeys singleton_pkeys) {
        if (singleton_pkeys.isMaybeSingleStr())
            return StringPKey.make(singleton_pkeys.getStr());
        Set<ObjectLabel> symbols = singleton_pkeys.getSymbols();
        if (symbols.size() == 1)
            return SymbolPKey.make(symbols.iterator().next());
        throw new AnalysisException("Expected singleton property keys");
    }

    /**
     * Returns a copy of this property key where the given object label has been replaced.
     *
     * @param oldlabel The object label to replace.
     * @param newlabel The object label to replace oldlabel with.
     */
    abstract public PKey replaceObjectLabel(ObjectLabel oldlabel, ObjectLabel newlabel);

    /**
     * Returns true if this property key contains the given object label.
     */
    abstract public boolean containsObjectLabel(ObjectLabel objlabel);

    /**
     * Constructs a property key as a copy of this value but with object labels summarized.
     */
    abstract public Set<PKey> summarize(Summarized s);

    /**
     * Property key for fixed string.
     */
    public static final class StringPKey extends PKey {

        public static final PKey __PROTO__ = make("__proto__");

        public static final PKey PROTOTYPE = make("prototype");

        public static final PKey LENGTH = make("length");

        private String str;

        private int hashcode;

        private StringPKey(String str) {
            this.str = str;
            this.hashcode = str.hashCode() + this.getClass().hashCode();
        }

        /**
         * Constructs a property key for a fixed string property.
         */
        public static StringPKey make(String str) {
            return Canonicalizer.get().canonicalize(new StringPKey(str));
        }

        @Override
        public boolean isArrayIndex() {
            return Strings.isArrayIndex(str);
        }

        @Override
        public boolean isMaybeValue(PKeys v) {
            return v.isMaybeStr(str);
        }

        /**
         * Returns the string.
         */
        public String getStr() {
            return str;
        }

        @Override
        public Value toValue() {
            return Value.makeStr(str);
        }

        @Override
        public String toString() {
            return str;
        }

        @Override
        public String toStringEscaped() {
            return Strings.escape(str);
        }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof PKey))
                throw new RuntimeException("Using " + o + "(" + o.getClass() + ") in place of PKey"); // FIXME: Remove when #332 is done
            return o instanceof StringPKey && getStr().equals(((StringPKey)o).getStr());
        }

        @Override
        public int hashCode() {
            return hashcode;
        }

        public StringPKey replaceObjectLabel(ObjectLabel oldlabel, ObjectLabel newlabel) {
            return this;
        }

        public boolean containsObjectLabel(ObjectLabel objlabel) {
            return false;
        }

        public Set<PKey> summarize(Summarized s) {
            return Collections.singleton(this);
        }
    }

    /**
     * Property key for Symbol.
     */
    public static final class SymbolPKey extends PKey {

        private ObjectLabel objlabel;

        private int hashcode;

        private SymbolPKey(ObjectLabel objlabel) {
            this.objlabel = objlabel;
            this.hashcode = objlabel.hashCode() + this.getClass().hashCode();
        }

        /**
         * Constructs a property key for a Symbol.
         */
        public static SymbolPKey make(ObjectLabel objlabel) {
            return Canonicalizer.get().canonicalize(new SymbolPKey(objlabel));
        }

        /**
         * Returns the object label.
         */
        public ObjectLabel getObjectLabel() {
            return objlabel;
        }

        @Override
        public Value toValue() {
            return Value.makeObject(objlabel);
        }

        @Override
        public boolean isArrayIndex() {
            return false;
        }

        @Override
        public boolean isMaybeValue(PKeys v) {
            return v.getSymbols().contains(objlabel);
        }

        @Override
        public String toString() {
            return "Symbol(" + objlabel + ")";
        }

        @Override
        public String toStringEscaped() {
            return toString();
        }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof PKey))
                throw new RuntimeException("Using " + o + "(" + o.getClass() + ") in place of PKey"); // FIXME: Remove when #332 is done
            return o instanceof SymbolPKey && getObjectLabel().equals(((SymbolPKey)o).getObjectLabel());

        }

        @Override
        public int hashCode() {
            return hashcode;
        }

        public SymbolPKey replaceObjectLabel(ObjectLabel oldlabel, ObjectLabel newlabel) {
            return objlabel.equals(oldlabel) ? make(newlabel) : this;
        }

        public boolean containsObjectLabel(ObjectLabel ol) {
            return objlabel.equals(ol);
        }

        public Set<PKey> summarize(Summarized s) {
            return s.summarize(Collections.singleton(objlabel)).stream().map(SymbolPKey::make).collect(Collectors.toSet());
        }

    }
}