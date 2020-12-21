---
title: Secure HA Kubernetes on bare metal using k3s
author: Claas Störtenbecker
date: 2020-12-21
hero: ./images/hero.jpg
excerpt: Walkthrough deploying secure HA Kubernetes on bare metal using k3s and embedded etcd.
---

>  This walkthrough will leave you with a `kubeconfig` to a fully functional, secure cluster.

# What is [k3s](https://github.com/k3s-io/k3s)?

Kubernetes ~~is~~ was too hard for the solo developer.
Using k3s you can deploy Kubernetes in a couple of commands per node.
The Kubernetes distribution is:
* fully conformant
* production-ready
* lightweight
* packaged in a single binary

*I personally run 3 SKVM-4G from [MaxKVM](https://www.maxkvm.com) for 18$/month with student discount.
Each node has 2 EPYC cores, 4GB ECC, 3TB traffic @ 1GBs, 75GB NVME; unmatched for that price.*

# 1. Setup node iptables

To isolate network communication we need to setup some firewall rules on each node.
This tutorial will use [ufw](https://help.ubuntu.com/community/UFW) to configure iptables but you may use any other tool.
I assume that each node will have two distinct network interfaces:
* `eth0` assigned with a public IP used for internet communication
* `eth1` assigned with a private IP used for intranet communication

We will start by blocking incoming and allowing outgoing traffic.

```shell
sudo ufw default allow outgoing
sudo ufw default deny incoming
```

Further we need to enable `ssh` access to the node.

```shell
sudo ufw allow ssh
```

We allow communication through the intranet. You can also add each node IP seperately.
In this example `eth1` is part of the subnet `172.16.0.0/12`.

```shell
sudo ufw allow from 172.16.0.0/12
```

We allow communication to the CNI (Container Network Interface) from the Pod CIDR.

```shell
sudo ufw allow in on cni0 from 10.42.0.0/16
```

We allow communication to the Kubernetes API.

```shell
sudo ufw allow 6443/tcp
```

# 2. Install Kubernetes

To join nodes k3s needs a shared secret. We can generate one with:

```shell
openssl rand -base64 32
```

### 2.1 First node

We configure necassary installation parameters on the server:

* `K3S_TOKEN` _the secret we generated in step 2_
* `INSTALL_K3S_EXEC` _arguments the k3s installer is called with_
    * `--cluster-init` _this node initializes a completely new cluster_
    * `-i {eth1_ip}` _this node uses the internal IP_
    * `--flannel-iface eth1` _the cluster network is build on the intranet_
    * `--disable traefik` _k3s ships with outdated traefik as ingress_

```shell
export K3S_TOKEN="{generated_secret}" &
export INSTALL_K3S_EXEC="server \ 
	--cluster-init \
	-i {eth1_ip} \
	--flannel-iface eth1 \
	--disable traefik"
```

Now we execute the install script.

```shell
curl -sfL https://get.k3s.io | sh -
```

### 2.2 Other nodes

Configuration is similar to the first node.
Now we do not initialize a cluster, but join the cluster that was created in **2.1**.

```shell
export K3S_TOKEN="{generated_secret}" &
export INSTALL_K3S_EXEC="server \ 
	--server https://{node1_internal_ip}:6443 \
	-i {eth1_ip} \
	--flannel-iface eth1 \
	--disable traefik"
```

Also execute the install script.

```shell
curl -sfL https://get.k3s.io | sh -
```

### 2.3 Finalize

On any node run `kubectl get nodes` to check if your cluster was build sucessfully.
Now remove from `/etc/systemd/system/k3s.service` on every node:

* `--cluster-init` *if it is the first node*
* `--server`  *else*

at the bottom of the file.

Reload and check the node after editing.

```shell
systemctl daemon-reload
service k3s restart
kubectl get nodes
```

**Copy `/etc/rancher/k3s/k3s.yaml` to your machine.
After that replace `localhost` with a node or loadbalancer IP and you are done.**
