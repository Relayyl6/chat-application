import dns from 'dns';
import { Resolver } from 'dns';

export function setupDNS() {
    // Set custom DNS servers
    dns.setServers([
        '8.8.8.8',      // Google DNS
        '8.8.4.4',      // Google DNS
        '1.1.1.1',      // Cloudflare DNS
        '1.0.0.1'       // Cloudflare DNS
    ]);
    
    // Prefer IPv4
    dns.setDefaultResultOrder('ipv4first');
    
    console.log('✅ DNS configured:', dns.getServers());
}