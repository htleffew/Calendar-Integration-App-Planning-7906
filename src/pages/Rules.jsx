import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScheduling } from '../context/SchedulingContext';
import RuleForm from '../components/RuleForm';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit3, FiTrash2, FiToggleLeft, FiToggleRight, FiClock, FiCalendar, FiShield } = FiIcons;

function Rules() {
  const { rules, dispatch } = useScheduling();
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      dispatch({ type: 'DELETE_RULE', payload: id });
    }
  };

  const handleToggleActive = (rule) => {
    dispatch({
      type: 'UPDATE_RULE',
      payload: { ...rule, active: !rule.active }
    });
  };

  const handleFormSubmit = (data) => {
    if (editingRule) {
      dispatch({
        type: 'UPDATE_RULE',
        payload: { ...editingRule, ...data }
      });
    } else {
      dispatch({
        type: 'ADD_RULE',
        payload: data
      });
    }
    setShowForm(false);
    setEditingRule(null);
  };

  const getRuleIcon = (type) => {
    switch (type) {
      case 'availability':
        return FiCalendar;
      case 'buffer':
        return FiClock;
      case 'restriction':
        return FiShield;
      default:
        return FiShield;
    }
  };

  const getRuleDescription = (rule) => {
    switch (rule.type) {
      case 'availability':
        return `${rule.conditions.days?.join(', ')} from ${rule.conditions.timeRange?.start} to ${rule.conditions.timeRange?.end}`;
      case 'buffer':
        return `${rule.conditions.minBuffer} minutes buffer between meetings`;
      case 'restriction':
        return rule.conditions.description || 'Custom restriction rule';
      default:
        return 'Custom rule';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scheduling Rules</h1>
            <p className="text-gray-600 mt-2">Configure advanced rules to control when and how meetings can be booked.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Rule</span>
          </motion.button>
        </div>

        <div className="space-y-4">
          {rules.map((rule, index) => {
            const IconComponent = getRuleIcon(rule.type);
            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-all ${
                  rule.active ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      rule.active ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <SafeIcon 
                        icon={IconComponent} 
                        className={`w-6 h-6 ${rule.active ? 'text-blue-600' : 'text-gray-400'}`} 
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                      <p className="text-gray-600">{getRuleDescription(rule)}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                        rule.type === 'availability' ? 'bg-green-100 text-green-800' :
                        rule.type === 'buffer' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleActive(rule)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <SafeIcon
                        icon={rule.active ? FiToggleRight : FiToggleLeft}
                        className={`w-8 h-8 ${rule.active ? 'text-green-500' : 'text-gray-300'}`}
                      />
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(rule)}
                      className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                      <span>Edit</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(rule.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {rules.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <SafeIcon icon={FiShield} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rules configured</h3>
              <p className="text-gray-500 mb-6">Create your first scheduling rule to control meeting availability.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                <span>Create Rule</span>
              </motion.button>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <RuleForm
              rule={editingRule}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingRule(null);
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Rules;