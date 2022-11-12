import * as pulumi from "@pulumi/pulumi";
import * as instances from "@cloudyskysoftware/pulumi-scaleway-instances";

// Paris 2 zone is environmentally friendly.
const zone = "fr-par-2";
const project = "65978379-535c-45a1-87be-92e4e3926db5";

const images = pulumi.output(
    instances.images.listImages({
        zone,
    })
);

const osVolume = new instances.volumes.Volume("osVolume", {
    name: "osVolume",
    project,
    size: 10 * 1000 * 1000 * 1000,
    volume_type: "b_ssd",
    zone,
});

const server = new instances.servers.Server("testServer", {
    name: "my-test-server",
    commercial_type: "PLAY2-PICO",
    boot_type: "local",
    dynamic_ip_required: false,
    enable_ipv6: true,
    image: images.items.images?.apply((i) => {
        const ubuntu = i?.filter(
            (img) =>
                img.arch === "x86_64" &&
                img.name === "Ubuntu 22.04 Jammy Jellyfish"
        )[0];

        return ubuntu!.id!;
    }),
    project,
    volumes: {
        0: {
            id: osVolume.id,
            name: "System volume",
        },
    },
    zone,
});

new instances.action.ServerAction("poweroffAction", {
    server_id: server.id,
    action: "poweroff",
    zone,
});
