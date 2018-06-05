const extend = require('extend');
/**
 * Helper service used by {@link TargetsFileRules} in order to create dynamic file rules for
 * multiple purposes.
 */
class TargetFileRule {
  /**
   * @param {Events}                events                   To reduce the rule settings updated.
   * @param {string}                ruleType                 A reference identifier that tells for
   *                                                         which kind file type the rule is
   *                                                         being used for.
   * @param {TargetFileRuleHandler} getSettingsForTargetRule To define the rule settings whenever
   *                                                         a new target is added.
   * @throws {Error} If `getSettingsForTargetRule` is not a function.
   */
  constructor(events, ruleType, getSettingsForTargetRule) {
    /**
     * A local reference for the `events` service.
     * @type {Events}
     */
    this.events = events;
    // Validate the handler function.
    if (typeof getSettingsForTargetRule !== 'function') {
      throw new Error('You need to specify a handler function for when a new target is added');
    }
    /**
     * The reference identifier for the kind of rule this is for.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._ruleType = ruleType;
    /**
     * The function that generates the new settings when a new target is added.
     * @type {TargetFileRuleHandler}
     * @access protected
     * @ignore
     */
    this._getSettingsForTargetRule = getSettingsForTargetRule;
    /**
     * The rule settings.
     * @type {TargetFileRuleSettings}
     * @access protected
     * @ignore
     */
    this._rule = {
      extension: /\.\w+$/i,
      glob: '**/*.css',
      paths: {
        include: [],
        exclude: [],
      },
      files: {
        include: [],
        exclude: [],
        glob: {
          include: [],
          exclude: [],
        },
      },
    };
    /**
     * Whether or not a target has been added to the rule.
     * @type {boolean}
     * @access protected
     * @ignore
     */
    this._hasTarget = false;
  }
  /**
   * Get the rule settings.
   * @return {TargetFileRuleSettings}
   */
  getRule() {
    return this._rule;
  }
  /**
   * Add a target to the rule. This means the instance will process it and eventually add its
   * paths to the settings.
   * This method uses the reducer event `target-file-rule`, and if a target was already added,
   * `target-file-rule-update` too. Both events receive the next state of the settings as well
   * as the current, and expect the final state on return.
   * @param {Target} target The target information.
   */
  addTarget(target) {
    const changes = extend(
      true,
      {},
      this._getSettingsForTargetRule(target, this._hasTarget, this._rule)
    );

    const finalRule = this._mergeRule(this._rule, changes);

    const events = ['target-file-rule'];
    if (this._hasTarget) {
      events.push('target-file-rule-update');
    }

    this._hasTarget = true;
    this._rule = this.events.reduce(events, finalRule, this._rule);
  }
  /**
   * Merge two sets of rule settings. This is also used recursively to merge nested settings.
   * @param {TargetFileRuleSettings|Object} base    The original rule or a set of properties of
   *                                                the original rule.
   * @param {TargetFileRuleSettings|Object} changes The rule that will be merged into the origina,
   *                                                or a set of properties from it.
   * @return {TargetFileRuleSettings|Object} The merged rule, or a set of merge properties.
   * @access protected
   * @ignore
   */
  _mergeRule(base, changes) {
    const newRule = extend(true, {}, base);
    Object.keys(changes).forEach((property) => {
      const value = changes[property];
      const propertyType = typeof value;
      if (Array.isArray(value)) {
        newRule[property].push(...value);
      } else if (value instanceof RegExp) {
        newRule[property] = value;
      } else if (propertyType === 'object') {
        newRule[property] = this._mergeRule(newRule[property], value);
      } else {
        newRule[property] = value;
      }
    });

    return newRule;
  }
}

module.exports = TargetFileRule;
