
<script>
    import { T } from '@threlte/core';
    import { Box } from '@threlte/extras';
    import Label from './Label.svelte';
    import { logStore } from '../stores/logStore';

  
    let logContainer;


    $: visibleLogs = $logStore.slice(-10).map((log, index) => ({
        ...log,
        
        position: { 
            x: -45, 
            y: 45 - (index * 10), 
            z: 0.1 
        }
    }));

 
    function formatLogMessage(log) {
        const timestamp = `[${log.timestamp}]`;
        const message = log.message;
        
        if (log.type === 'progress') {
            const progress = `${log.progress.toFixed(1)}%`;
            return `${timestamp} ${message} - ${progress}`;
        }
        
        return `${timestamp} ${message}`;
    }

 
    const logColors = {
        info: '#ffffff',
        error: '#ff5555',
        progress: '#4CAF50'
    };
</script>

<Box class="h-full w-full flex-1" let:width let:height>
    <T.Group
        on:create={({ cleanup }) => {
            cleanup(() => {
                console.log('Logger cleanup');
            });
        }}
        bind:this={logContainer}
    > 
        <T.Mesh position.z={20}>
      
            <T.PlaneGeometry args={[100, 100, 2]} />
            <T.MeshBasicMaterial 
                color="#1a1a1a" 
                transparent={true} 
                opacity={0.8} 
            />

         
            {#if visibleLogs.length > 0}
                {#each visibleLogs as log (log.id)}
                    <Label 
                        position={log.position}
                        text={formatLogMessage(log)}
                        color={logColors[log.type]}
                        fontSize="xl"
                        anchorX="left" 
                        maxWidth={90} 
                    />

                    
                    {#if log.type === 'progress'}
                        <T.Group position.x={log.position.x + 70} position.y={log.position.y}>
                            <!-- Progress bar background -->
                            <T.Mesh>
                                <T.PlaneGeometry args={[20, 1]} />
                                <T.MeshBasicMaterial color="#333333" />
                            </T.Mesh>
                            
                          
                            <T.Mesh position.x={-10 + (log.progress / 10)}>
                                <T.PlaneGeometry args={[(log.progress / 5), 0.8]} />
                                <T.MeshBasicMaterial color="#4CAF50" />
                            </T.Mesh>
                        </T.Group>
                    {/if}
                {/each}
            {/if}
        </T.Mesh>
    </T.Group>
</Box>