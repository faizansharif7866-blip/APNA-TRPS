import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './server/src/auth/authRoutes.js';
import adminRoutes from './server/src/administrators/adminRoutes.js';
import operatorRoutes from './server/src/operators/operatorRoutes.js';
import customerRoutes from './server/src/customers/customerRoutes.js';
import { validateBusLayout, BusLayoutValidationReport } from './src/services/busLayoutValidator.js';
import { BusFleetConfiguration } from './packages/shared-types/index.js';
import { db } from './server/src/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

/**
 * Core Health Check Endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ApnaTrips Core Unified Backend API',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    port: PORT,
    connectedApps: [
      { name: 'Customer Application (Public Website)', domain: 'www.apnatrips.com', path: '/' },
      { name: 'Admin Portal (Separate Website)', domain: 'admin.apnatrips.com', path: '/admin' },
      { name: 'Partner & Bus Operator Portal (Separate Website)', domain: 'partners.apnatrips.com', path: '/partner' }
    ]
  });
});

/**
 * 1. Mount Modular Backend API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/operator', operatorRoutes);
app.use('/api/customer', customerRoutes);

/**
 * 2. Bus Configuration Validation & Publishing Endpoints (Compatible with Builder)
 */
app.post('/api/bus-configurations/validate', (req: Request, res: Response) => {
  try {
    const { busName, registrationNumber, category, deckType, positions } = req.body;

    if (!deckType || !Array.isArray(positions)) {
      return res.status(400).json({
        isValid: false,
        errors: ['Invalid payload: deckType and positions array are required.'],
        warnings: [],
      });
    }

    const report: BusLayoutValidationReport = validateBusLayout({
      busName,
      registrationNumber,
      category,
      deckType,
      positions,
    });

    return res.status(200).json(report);
  } catch (err: any) {
    console.error('Validation error:', err);
    return res.status(500).json({
      isValid: false,
      errors: ['Internal server error executing bus layout validation.'],
      details: err?.message,
    });
  }
});

app.post('/api/bus-configurations/publish', (req: Request, res: Response) => {
  try {
    const config = req.body as BusFleetConfiguration;

    if (!config || !config.positions || !config.deckType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: Bus configuration data missing.',
      });
    }

    const report: BusLayoutValidationReport = validateBusLayout({
      busName: config.busName,
      registrationNumber: config.registrationNumber,
      category: config.category,
      deckType: config.deckType,
      positions: config.positions,
    });

    if (!report.isValid) {
      return res.status(422).json({
        success: false,
        message: 'Server Validation Failed: Bus configuration does not meet safety and layout compliance requirements.',
        validationReport: report,
      });
    }

    const publishedConfig: BusFleetConfiguration = {
      ...config,
      id: config.id || `bus-${Date.now()}`,
      status: 'published',
      updatedAt: new Date().toISOString(),
    };

    db.busConfigurations.unshift(publishedConfig);

    return res.status(201).json({
      success: true,
      message: `Bus configuration ${publishedConfig.busName} (${publishedConfig.registrationNumber}) passed all safety audits and is now published!`,
      busConfiguration: publishedConfig,
      auditId: `AUDIT-LAYOUT-${Date.now()}`,
      validationReport: report,
    });
  } catch (err: any) {
    console.error('Publish error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to publish bus layout configuration.',
      details: err?.message,
    });
  }
});

app.get('/api/bus-configurations', (_req: Request, res: Response) => {
  return res.json({
    totalCount: db.busConfigurations.length,
    configurations: db.busConfigurations,
  });
});

/**
 * 3. Frontend Multi-Application Serving
 * Supports 3 completely separate websites connected to the one secure backend:
 * - www.apnatrips.com (Customer Web)
 * - admin.apnatrips.com (Admin Web)
 * - partners.apnatrips.com (Partner Web)
 */
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        const host = req.headers.host || '';
        const url = req.url;

        if (host.startsWith('admin.') || url.startsWith('/admin')) {
          const adminHtml = path.resolve(distPath, 'admin.html');
          if (fs.existsSync(adminHtml)) {
            return res.sendFile(adminHtml);
          }
        }

        if (host.startsWith('partner.') || host.startsWith('partners.') || url.startsWith('/partner')) {
          const partnerHtml = path.resolve(distPath, 'partner.html');
          if (fs.existsSync(partnerHtml)) {
            return res.sendFile(partnerHtml);
          }
        }

        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ApnaTrips Server] Multi-application ecosystem live on http://0.0.0.0:${PORT}`);
    console.log(`- 1. Customer Application: http://localhost:${PORT}/ (or www.apnatrips.com)`);
    console.log(`- 2. Admin Portal:         http://localhost:${PORT}/admin (or admin.apnatrips.com)`);
    console.log(`- 3. Partner Portal:       http://localhost:${PORT}/partner (or partners.apnatrips.com)`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
