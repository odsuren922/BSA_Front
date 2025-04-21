import React, { useState } from 'react';
import { Button, Card, Input, Collapse, Alert, Spin, Divider, Typography, Space } from 'antd';
import { testCORSConfiguration, logSecurityContext } from '../../utils/corsDebug';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const CORSDebugger = () => {
  const [testEndpoint, setTestEndpoint] = useState('api/user');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runCORSTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Log security context first
      logSecurityContext();
      
      // Run the test
      const testResults = await testCORSConfiguration(testEndpoint);
      setResults(testResults);
      
      // Check for success or failure indicators
      if (!testResults.success) {
        setError(`Test failed: ${testResults.error?.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Error running test: ${err.message}`);
      console.error('CORS Test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderHeaderInfo = (title, content, type = 'info') => (
    <Alert
      message={title}
      description={content}
      type={type}
      showIcon
      style={{ marginBottom: 16 }}
    />
  );

  const renderJsonDisplay = (data) => (
    <pre style={{ 
      background: '#f6f8fa', 
      padding: 16, 
      borderRadius: 4,
      maxHeight: '300px',
      overflow: 'auto'
    }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );

  return (
    <Card title="CORS Configuration Debugger" style={{ marginBottom: 24 }}>
      {renderHeaderInfo(
        "What this tool does",
        "This tool helps diagnose CORS (Cross-Origin Resource Sharing) issues by testing your API endpoints and analyzing the responses."
      )}
      
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5}>1. Enter an endpoint to test:</Title>
          <Input
            value={testEndpoint}
            onChange={e => setTestEndpoint(e.target.value)}
            placeholder="api/endpoint"
            addonBefore="http://127.0.0.1:8000/"
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <Button 
            type="primary" 
            onClick={runCORSTest}
            loading={loading}
          >
            Run CORS Test
          </Button>
        </div>
        
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
        )}
        
        {results && (
          <Collapse defaultActiveKey={['1', '2']}>
            <Panel header="Test Summary" key="1">
              <Alert
                message={results.success ? "CORS Test Passed" : "CORS Test Failed"}
                description={
                  results.success 
                    ? "Your CORS configuration appears to be working correctly."
                    : "There are issues with your CORS configuration."
                }
                type={results.success ? "success" : "error"}
                showIcon
              />
              
              {!results.success && results.error && (
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>Error Details:</Title>
                  {renderJsonDisplay(results.error)}
                </div>
              )}
            </Panel>
            
            <Panel header="CORS Headers" key="2">
              <Title level={5}>OPTIONS Request Headers:</Title>
              {results.details.optionsHeaders && renderJsonDisplay(results.details.optionsHeaders)}
              
              <Divider />
              
              <Title level={5}>GET Request Headers:</Title>
              {results.details.getHeaders && renderJsonDisplay(results.details.getHeaders)}
              
              <Divider />
              
              <Alert
                message="CORS Headers Check"
                description={
                  results.details.corsHeadersPresent
                    ? "All required CORS headers are present."
                    : "Some CORS headers are missing."
                }
                type={results.details.corsHeadersPresent ? "success" : "warning"}
                showIcon
              />
            </Panel>
            
            <Panel header="Raw Test Results" key="3">
              {renderJsonDisplay(results)}
            </Panel>
          </Collapse>
        )}
      </Space>
    </Card>
  );
};

export default CORSDebugger;